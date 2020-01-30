function validacceptprobability (acceptprobability) {
  if (!lib.isNumber(acceptprobability)) {
    return 1;
  }
  if (acceptprobability>1) {
    return 1;
  }
  if (acceptprobability<0) {
    return 0;
  }
  return acceptprobability;
}

function CandidateChooserJob (sink, username, targetcount, targetedusers, acceptprobability) {
  qlib.JobOnDestroyable.call(this, sink);
  this.username = username;
  this.targetsmade = 0;
  this.targetcount = targetcount;
  this.targetedusers = targetedusers;
  this.acceptprobability = validacceptprobability(acceptprobability);
  this.distfilter = {
    op: 'near',
    field: 'location',
    value: randomGeoLocation(),
    maxDistance: 100
  };
}
lib.inherit(CandidateChooserJob, qlib.JobOnDestroyable);
CandidateChooserJob.prototype.destroy = function () {
  this.distfilter = null;
  this.acceptprobability = null;
  this.targetedusers = null;
  this.targetsmade = null;
  this.username = null;
  qlib.JobOnDestroyable.prototype.destroy.call(this);
};
CandidateChooserJob.prototype.go = function () {
  var ok = this.okToGo();
  if (!ok.ok) {
    return ok.val;
  }
  if (!lib.isNumber(this.targetsmade)) {
    this.resolve(0);
    return ok.val;
  }
  if (!lib.isNumber(this.targetcount)) {
    this.resolve(0);
    return ok.val;
  }
  this.doDaCycle();
  return ok.val;
};
CandidateChooserJob.prototype.doDaCycle = function () {
  if (!this.okToProceed()) {
    return;
  }
  if (this.targetsmade >= this.targetcount) {
    this.resolve(this.targetsmade);
    return;
  }
  this.destroyable.call('getCandidates', this.username, [this.distfilter]).then(
    this.onCandidates.bind(this),
    this.reject.bind(this)
  );
};
CandidateChooserJob.prototype.onCandidates = function (cnds) {
  var cndname, callname;
  if (!this.okToProceed()) {
    return;
  }
  //console.log((lib.isArray(cnds) ? cnds.length : 'no'), 'candidates');
  if (!(lib.isArray(cnds) && cnds.length>0)) {
    this.checkForEnd();
    return;
  }
  cndname = cnds[0].username;
  callname = (Math.random() < this.acceptprobability) ? 'initiateRelation' : 'blockRelation';
  //console.log('my candidate', cndname, 'at distance', this.distfilter.maxDistance);
  console.log('will', callname);
  this.destroyable.call(callname, this.username, cndname).then(
    this.onTargetCreated.bind(this, cndname),
    this.onTargetFailed.bind(this)
  );
  cndname = null;
};
CandidateChooserJob.prototype.checkForEnd = function () {
  if (this.distfilter.maxDistance>1e7) {
    console.log('Exceeded max distance with', this.targetsmade, 'targets');
    this.resolve(this.targetsmade);
    return;
  }
  this.distfilter.maxDistance*=2;
  this.doDaCycle();
};
CandidateChooserJob.prototype.onTargetCreated = function (cndname) {
  if (lib.isArray(this.targetedusers) && this.targetedusers.indexOf(cndname)<0) {
    this.targetedusers.push(cndname);
  }
  this.targetsmade ++;
  this.doDaCycle();
};
CandidateChooserJob.prototype.onTargetFailed = function (reason) {
  if (reason && reason.code === 'DUPLICATE_KEY') {
    this.doDaCycle();
    return;
  }
  this.reject(reason);
};


function initiateRelations (sinkname, username, targetcount, targetedusers, acceptprobability) {
  it('Creating '+targetcount+' Targets for '+username, function () {
    var ret;
    this.timeout(1e5);
    ret = (new CandidateChooserJob(getGlobal(sinkname), username, targetcount, targetedusers, acceptprobability)).go();
    targetedusers = null;
    return ret;
  });
}

setGlobal('initiateRelations', initiateRelations);

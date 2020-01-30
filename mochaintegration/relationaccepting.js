function LookAtInstantiationsAndAcceptJob (sink, targetedusers) {
  qlib.JobOnDestroyable.call(this, sink);
  this.targetedusers = lib.isArray(targetedusers) ? targetedusers.slice() : [];
  this.count = this.targetedusers.length;
  this.targetsdone = 0;
  this.relationsaccepted = 0;
}
lib.inherit(LookAtInstantiationsAndAcceptJob, qlib.JobOnDestroyable);
LookAtInstantiationsAndAcceptJob.prototype.destroy = function () {
  this.relationsaccepted = null;
  this.targetsdone = null;
  this.count = null;
  qlib.JobOnDestroyable.prototype.destroy.call(this);
};
LookAtInstantiationsAndAcceptJob.prototype.go = function () {
  var ok = this.okToGo();
  if (!ok.ok) {
    return ok.val;
  }
  if (!lib.isNumber(this.count)) {
    this.resolve(0);
    return ok.val;
  }
  if (!lib.isNumber(this.targetsdone)) {
    this.resolve(0);
    return ok.val;
  }
  this.doOne();
  return ok.val;
};
LookAtInstantiationsAndAcceptJob.prototype.doOne = function () {
  if (!this.okToProceed()) {
    return;
  }
  if (this.targetsdone>=this.count) {
    console.log(this.relationsaccepted, 'Relations accepted on', this.targetsdone, 'Targets');
    this.resolve(this.targetsdone);
    return;
  }
  this.destroyable.call('getInitiators', this.targetedusers[this.targetsdone]).then(
    this.onInitiators.bind(this),
    this.reject.bind(this)
  );
};
LookAtInstantiationsAndAcceptJob.prototype.onInitiators = function (intrs) {
  var intr;
  if (!this.okToProceed()) {
    return;
  }
  //console.log('for', this.targetedusers[this.targetsdone], 'likes', intrs);
  if (!(lib.isArray(intrs) && intrs.length>0)) {
    this.targetsdone++;
    this.doOne();
    return;
  }
  intr = intrs[0];
  //console.log('Initiator', intr);
  this.destroyable.call('acceptRelation', this.targetedusers[this.targetsdone], intr.username).then(
    this.onAccepted.bind(this),
    this.reject.bind(this)
  );
};
LookAtInstantiationsAndAcceptJob.prototype.onAccepted = function (res) {
  if (res) {
    this.relationsaccepted++;
  }
  this.doOne();
};

function lookAtInstantiationsAndAccept (sinkname, targetedusers) {
  it('Looking at Instantiations and accepting them', function () {
    var ret;
    this.timeout(1e6);
    ret = (new LookAtInstantiationsAndAcceptJob(getGlobal(sinkname), targetedusers)).go();
    targetedusers = null;
    return ret;
  });
}

setGlobal('lookAtInstantiationsAndAccept', lookAtInstantiationsAndAccept);

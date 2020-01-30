function createInitiateRelationJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  var SubSinksJob = mylib.SubSinksJob,
    qlib = lib.qlib;

  function InitiateRelationJob (service, initiatorname, targetname, defer) {
    SubSinksJob.call(this, service, defer);
    this.initiatorname = initiatorname;
    this.targetname = targetname;
  }
  lib.inherit(InitiateRelationJob, SubSinksJob);
  InitiateRelationJob.prototype.destroy = function () {
    this.targetname = null;
    this.initiatorname = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  InitiateRelationJob.prototype.useSubSinks = function () {
    (new mylib.AcceptRelationJob(this.destroyable, this.initiatorname, this.targetname, true)).go().then(
      this.onPossiblyAccepted.bind(this),
      this.reject.bind(this)
    );
    //this.checkForTargetInitiated();
  };
  InitiateRelationJob.prototype.onPossiblyAccepted = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    if (res) {
      this.resolve(res);
      return;
    }
    this.doInitiate();
  };
  InitiateRelationJob.prototype.doInitiate = function () {
    this.relationsink.call('create', {
      initiator: this.initiatorname,
      target: this.targetname,
      initiationtimestamp: Date.now()
    }).then(
      this.onSucceeded.bind(this),
      this.onFailed.bind(this)
    )
  };
  InitiateRelationJob.prototype.onSucceeded = function (result) {
    if (!this.okToProceed()) {
      return;
    }
    if (!(result && result.initiator === this.initiatorname && result.target === this.targetname)) {
      throw new Error('Accepted relation mismatch!');
    }
    this.destroyable.announceRWCEvent({
      event: 'initiated',
      initiator: this.initiatorname,
      target: this.targetname
    });
    this.resolve(result.initiationtimestamp);
  };
  InitiateRelationJob.prototype.onFailed = function (reason) {
    if (!this.okToProceed()) {
      return;
    }
    if (reason && reason.code === 'DUPLICATE_KEY') {
      this.resolve(true);
      return;
    }
    this.reject(reason);
  };

  mylib.InitiateRelationJob = InitiateRelationJob;
}
module.exports = createInitiateRelationJob;

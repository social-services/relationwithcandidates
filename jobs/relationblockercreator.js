function createBlockRelationJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  var SubSinksJob = mylib.SubSinksJob,
    qlib = lib.qlib;

  function BlockRelationJob (service, initiatorname, targetname, defer) {
    SubSinksJob.call(this, service, defer);
    this.initiatorname = initiatorname;
    this.targetname = targetname;
  }
  lib.inherit(BlockRelationJob, SubSinksJob);
  BlockRelationJob.prototype.destroy = function () {
    this.targetname = null;
    this.initiatorname = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  BlockRelationJob.prototype.useSubSinks = function () {
    this.relationsink.call('create', {
      initiator: this.initiatorname,
      target: this.targetname,
      initiationtimestamp: -1*Date.now()
    }).then(
      this.onSucceeded.bind(this),
      this.onFailed.bind(this)
    )
  };
  BlockRelationJob.prototype.onSucceeded = function (result) {
    if (!this.okToProceed()) {
      return;
    }
    if (!(result && result.initiator === this.initiatorname && result.target === this.targetname)) {
      throw new Error('Blocked relation mismatch!');
    }
    this.destroyable.announceRWCEvent({
      event: 'blocked',
      initiator: this.initiatorname,
      target: this.targetname
    });
    this.resolve(result.initiationtimestamp);
  };
  BlockRelationJob.prototype.onFailed = function (reason) {
    if (!this.okToProceed()) {
      return;
    }
    if (reason && reason.code === 'DUPLICATE_KEY') {
      this.resolve(true);
      return;
    }
    this.reject(reason);
  };

  mylib.BlockRelationJob = BlockRelationJob;
}
module.exports = createBlockRelationJob;

function createDropRelationJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    SubSinksJob = mylib.SubSinksJob;

  function DropRelationJob (service, initiatorname, targetname, defer) {
    SubSinksJob.call(this, service, defer);
    this.initiatorname = initiatorname;
    this.targetname = targetname;
  }
  lib.inherit(DropRelationJob, SubSinksJob);
  DropRelationJob.prototype.destroy = function () {
    this.targetname = null;
    this.initiatorname = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  DropRelationJob.prototype.useSubSinks = function () {
    this.relationsink.call('delete', this.theFilter()).then(
      this.onDeleted.bind(this),
      this.reject.bind(this)
    );
  };
  DropRelationJob.prototype.onDeleted = function (res) {
    var result = lib.isNumber(res) ? res>0 : false;
    if (!this.okToProceed()) {
      return;
    }
    if (result) {
      this.destroyable.announceRWCEvent({
        event: 'broken',
        initiator: this.initiatorname,
        target: this.targetname
      });
    }
    this.resolve(result);
  };
  DropRelationJob.prototype.theFilter = function () {
    return {
      op: 'and', 
      filters: [{
        op: 'eq',
        field: 'initiator',
        value: this.initiatorname
      },{
        op: 'eq',
        field: 'target',
        value: this.targetname
      }]
    };
  };

  mylib.DropRelationJob = DropRelationJob;
}
module.exports = createDropRelationJob;

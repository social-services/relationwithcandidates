function createRejectRelationJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    SubSinksJob = mylib.SubSinksJob;

  function RejectRelationJob (service, targetname, initiatorname, defer) {
    SubSinksJob.call(this, service, defer);
    this.targetname = targetname;
    this.initiatorname = initiatorname;
  }
  lib.inherit(RejectRelationJob, SubSinksJob);
  RejectRelationJob.prototype.destroy = function () {
    this.initiatorname = null;
    this.targetname = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  RejectRelationJob.prototype.useSubSinks = function () {
    this.checkForRejectedAlready();
  };
  RejectRelationJob.prototype.checkForRejectedAlready = function () {
    var filter;
    if (!this.okToProceed()) {
      return;
    }
    filter = this.theFilter();
    if (!filter) {
      return;
    }
    taskRegistry.run('readFromDataSink', {
      sink: this.relationsink,
      filter: filter,
      singleshot: true,
      cb: this.onCheckedForRejectedAlready.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  RejectRelationJob.prototype.onCheckedForRejectedAlready = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    if (res) {
      if (!lib.isNumber(res.initiationtimestamp)) {
        this.resolve(false);
        return;
      }
      if (res.initiationtimestamp<0) {
        this.resolve(false);
        return;
      }
      if (lib.isNumber(res.acceptancetimestamp)) {
        this.resolve(res.acceptancetimestamp<0);
        return;
      }
      this.doTheRejection();
      return;
    }
    this.resolve(false);
  };
  RejectRelationJob.prototype.doTheRejection = function () {
    var filter;
    if (!this.okToProceed()) {
      return;
    }
    filter = this.theFilter();
    this.relationsink.call('update', filter, {acceptancetimestamp: -Date.now()}, {op:'set'}).then(
      this.onRejected.bind(this),
      this.reject.bind(this)
    )
  };
  RejectRelationJob.prototype.onRejected = function (res) {
    var result = (res && res.updated>0);
    if (!this.okToProceed()) {
      return;
    }
    this.resolve(result);
  };
  RejectRelationJob.prototype.theFilter = function () {
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

  mylib.RejectRelationJob = RejectRelationJob;
}
module.exports = createRejectRelationJob;

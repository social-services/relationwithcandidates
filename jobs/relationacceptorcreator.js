function createAcceptRelationJob (execlib, mylib) {
  'use strict';

  var lib = execlib.lib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry,
    SubSinksJob = mylib.SubSinksJob;

  function AcceptRelationJob (service, targetname, initiatorname, bilateral, defer) {
    SubSinksJob.call(this, service, defer);
    this.targetname = targetname;
    this.initiatorname = initiatorname;
    this.bilateral = bilateral || false;
  }
  lib.inherit(AcceptRelationJob, SubSinksJob);
  AcceptRelationJob.prototype.destroy = function () {
    this.bilateral = null;
    this.initiatorname = null;
    this.targetname = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  AcceptRelationJob.prototype.useSubSinks = function () {
    this.checkForAcceptedAlready();
  };
  AcceptRelationJob.prototype.checkForAcceptedAlready = function () {
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
      cb: this.onCheckedForAcceptedAlready.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  AcceptRelationJob.prototype.onCheckedForAcceptedAlready = function (res) {
    if (!this.okToProceed()) {
      return;
    }
    if (res) {
      if (lib.isNumber(res.initiationtimestamp) && res.initiationtimestamp<0) {
        this.resolve(false);
        return;
      }
      if (!lib.isNumber(res.acceptancetimestamp)) {
        this.doTheAcceptance();
        return;
      }
      this.resolve(true);
      return;
    }
    this.resolve(false);
  };
  AcceptRelationJob.prototype.doTheAcceptance = function () {
    var filter;
    if (!this.okToProceed()) {
      return;
    }
    filter = this.theFilter();
    if (!filter) {
      return;
    }
    this.relationsink.call('update', filter, {acceptancetimestamp: Date.now()}, {op:'set'}).then(
      this.onAccepted.bind(this),
      this.reject.bind(this)
    )
  };
  AcceptRelationJob.prototype.onAccepted = function (res) {
    //console.log('onAccepted', res);
    var result = (res && res.updated>0);
    if (!this.okToProceed()) {
      return;
    }
    if (result) {
      this.destroyable.announceRWCEvent({
        event: 'accepted',
        initiator: this.initiatorname,
        target: this.targetname,
        bilateral: this.bilateral
      });
    }
    this.resolve(result);
  };
  AcceptRelationJob.prototype.theFilter = function () {
    return {
      op: 'or',
      filters: [{
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
      },{
        op: 'and', 
        filters: [{
          op: 'eq',
          field: 'initiator',
          value: this.targetname
        },{
          op: 'eq',
          field: 'target',
          value: this.initiatorname
        }]
      }]
    };
  };

  mylib.AcceptRelationJob = AcceptRelationJob;
}
module.exports = createAcceptRelationJob;

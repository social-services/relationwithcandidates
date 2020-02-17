function createGetCandidatesJob (execlib, mylib) {
  'use strict';

  var SubSinksJob = mylib.SubSinksJob, 
    lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  function GetCandidatesJob (service, username, filters, defer) {
    SubSinksJob.call(this, service, defer);
    this.username = username;
    this.filters = filters;
    this.nin = [this.username];
  }
  lib.inherit(GetCandidatesJob, SubSinksJob);
  GetCandidatesJob.prototype.destroy = function () {
    this.filters = null;
    this.username = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  GetCandidatesJob.prototype.useSubSinks = function () {
    taskRegistry.run('readFromDataSink', {
      sink: this.relationsink,
      filter: {
        op: 'eq',
        field: 'initiator',
        value: this.username
      },
      singleshot: false,
      visiblefields:['target'],
      cb: this.onRelatedTargets.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  function targeter(relateduserobj) {
    return relateduserobj.target;
  }
  function initiatorer(relateduserobj) {
    return relateduserobj.initiator;
  }
  GetCandidatesJob.prototype.onRelatedTargets = function (relatedtargets) {
    if (!this.okToProceed()) {
      return;
    }
    console.log('relatedtargets', relatedtargets);
    this.nin.push.apply(this.nin, relatedtargets.map(targeter));
    taskRegistry.run('readFromDataSink', {
      sink: this.relationsink,
      filter: {
        op: 'and',
        filters: [{
          op: 'eq',
          field: 'target',
          value: this.username
        },{
          op: 'ne',
          field: 'acceptancetimestamp',
          value: null
        }]
      },
      singleshot: false,
      visiblefields:['initiator'],
      cb: this.onRelatedInitiators.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  GetCandidatesJob.prototype.onRelatedInitiators = function (relatedinitiators) {
    if (!this.okToProceed()) {
      return;
    }
    console.log('relatedinitiators', relatedinitiators);
    this.nin.push.apply(this.nin, relatedinitiators.map(initiatorer));
    taskRegistry.run('readFromDataSink', {
      sink: this.userssink,
      filter: {
        op: 'and',
        filters: this.usersFilter(this.nin)
      },
      limit: 10,
      singleshot: false,
      cb: this.onCandidates.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  GetCandidatesJob.prototype.onCandidates = function (candidates) {
    //console.log('candidates', candidates);
    //console.log('candidates', candidates.length);
    this.resolve(candidates);
  };
  GetCandidatesJob.prototype.usersFilter = function (nin) {
    var ret = [{
      op: 'nin',
      field: 'username',
      value: nin
    }];
    ret = lib.isArray(this.filters) ? ret.concat(this.filters) : ret;
    console.log('GetCandidatesJob usersFilter', ret);
    return ret;
  };

  mylib.GetCandidatesJob = GetCandidatesJob;
}
/*
          op: 'and',
          filters: [{
            op: 'eq',
            field: 'target',
            value: this.username
          },{
            op: 'ne',
            field: 'acceptancetimestamp',
            value: null
          }]
*/
module.exports = createGetCandidatesJob;

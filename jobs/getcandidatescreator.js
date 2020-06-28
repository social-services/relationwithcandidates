function createGetCandidatesJob (execlib, mylib) {
  'use strict';

  var _COUNT = 10;

  var SubSinksJob = mylib.SubSinksJob, 
    lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  function GetCandidatesJob (service, username, filters1, filters2, defer) {
    SubSinksJob.call(this, service, defer);
    this.username = username;
    this.filters1 = filters1;
    this.filters2 = filters2;
    this.nin = [this.username];
  }
  lib.inherit(GetCandidatesJob, SubSinksJob);
  GetCandidatesJob.prototype.destroy = function () {
    this.filters2 = null;
    this.filters1 = null;
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
        filters: this.usersFilter1(this.nin)
      },
      limit: _COUNT,
      singleshot: false,
      cb: this.onCandidates1.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  GetCandidatesJob.prototype.onCandidates1 = function (candidates) {
    if (!this.okToProceed()) {
      return;
    }
    console.log('onCandidates1', lib.isArray(candidates) ? candidates.length : 'none');
    if (lib.isArray(candidates) && candidates.length>=_COUNT) {
      this.resolve(candidates);
      return;
    }
    taskRegistry.run('readFromDataSink', {
      sink: this.userssink,
      filter: {
        op: 'and',
        filters: this.usersFilter2(this.nin)
      },
      limit: _COUNT-candidates.length,
      singleshot: false,
      cb: this.onCandidates2.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  GetCandidatesJob.prototype.onCandidates2 = function (candidates) {
    if (!this.okToProceed()) {
      return;
    }
    console.log('onCandidates2', lib.isArray(candidates) ? candidates.length : 'none');
    //console.log('candidates', candidates);
    //console.log('candidates', candidates.length);
    this.resolve(candidates);
  };
  GetCandidatesJob.prototype.usersFilter1 = function (nin) {
    var ret = [{
      op: 'nin',
      field: 'username',
      value: nin
    }];
    ret = lib.isArray(this.filters1) ? ret.concat(this.filters1) : ret;
    console.log('GetCandidatesJob usersFilter1', require('util').inspect(ret, {colors: true, depth: 7}));
    return ret;
  };
  GetCandidatesJob.prototype.usersFilter2 = function (nin) {
    var ret = [{
      op: 'nin',
      field: 'username',
      value: nin
    }];
    ret = lib.isArray(this.filters2) ? ret.concat(this.filters2) : ret;
    console.log('GetCandidatesJob usersFilter2', require('util').inspect(ret, {colors: true, depth: 7}));
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

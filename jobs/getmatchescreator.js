function createGetMatchesJob (execlib, mylib) {
  'use strict';

  var SubSinksJob = mylib.SubSinksJob, 
    lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  function GetMatchesJob (service, username, defer) {
    SubSinksJob.call(this, service, defer);
    this.username = username;
  }
  lib.inherit(GetMatchesJob, SubSinksJob);
  GetMatchesJob.prototype.destroy = function () {
    this.username = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  GetMatchesJob.prototype.useSubSinks = function () {
    console.log('matches for', this.username, '?');
    taskRegistry.run('readFromDataSink', {
      sink: this.relationsink,
      filter: {
        op: 'and',
        filters: [{
          op: 'or',
          filters: [{
            op: 'eq',
            field: 'initiator',
            value: this.username
          },{
            op: 'eq',
            field: 'target',
            value: this.username
          }]
        },{
          op: 'gt',
          field: 'acceptancetimestamp',
          value: 0
        },{
          op: 'gt',
          field: 'initiationtimestamp',
          value: 0
        }]
      },
      singleshot: false,
      continuous: false,
      limit: 10,
      visiblefields:['initiator', 'target', 'initiationtimestamp'],
      cb: this.onMatches.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  function ider (username, match) {
    if (match.target === username) {
      return match.initiator;
    }
    if (match.initiator === username) {
      return match.target;
    }
  }
  GetMatchesJob.prototype.onMatches = function (matches) {
    var username;
    console.log('onMatches', matches);
    if (!this.okToProceed()) {
      return;
    }
    if (!(lib.isArray(matches) && matches.length)) {
      this.resolve([]);
      return;
    }
    username = this.username;
    taskRegistry.run('readFromDataSink', {
      sink: this.userssink,
      filter: {
        op: 'in',
        field: 'username',
        value: matches.map(ider.bind(null, username))
      },
      singleshot: false,
      continuous: false,
      cb: this.resolve.bind(this),
      errorcb: this.reject.bind(this)
    });
    username = null;
  };

  mylib.GetMatchesJob = GetMatchesJob;
}
module.exports = createGetMatchesJob;

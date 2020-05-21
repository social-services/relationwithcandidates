function createGetMatchesJob (execlib, mylib, arrayoperationslib) {
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
    this.matches = null;
  }
  lib.inherit(GetMatchesJob, SubSinksJob);
  GetMatchesJob.prototype.destroy = function () {
    this.matches = null;
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
      visiblefields:['initiator', 'target', 'acceptancetimestamp'],
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
    //console.log('onMatches', matches);
    if (!this.okToProceed()) {
      return;
    }
    if (!(lib.isArray(matches) && matches.length)) {
      this.resolve([]);
      return;
    }
    this.matches = matches;
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
      cb: this.onUsers.bind(this),
      errorcb: this.reject.bind(this)
    });
    username = null;
  };
  GetMatchesJob.prototype.onUsers = function (users) {
    this.resolve(users.reduce(this.joinUserWithMatch.bind(this), []));
  };
  GetMatchesJob.prototype.joinUserWithMatch = function (result, user) {
    var m = arrayoperationslib.findElementWithProperty(this.matches, 'initiator', user.username);
    if (!m) {
      m = arrayoperationslib.findElementWithProperty(this.matches, 'target', user.username);
    }
    //console.log('m', m);
    if (!m) {
      return result;
    }
    user.matchedon = m.acceptancetimestamp;
    result.push(user);
    return result;
  };


  mylib.GetMatchesJob = GetMatchesJob;
}
module.exports = createGetMatchesJob;

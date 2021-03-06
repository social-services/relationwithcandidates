function createGetInitiatorsJob (execlib, mylib, arrayoperationslib) {
  'use strict';

  var SubSinksJob = mylib.SubSinksJob, 
    lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  function GetInitiatorsJob (service, username, defer) {
    SubSinksJob.call(this, service, defer);
    this.username = username;
    this.initiators = null;
  }
  lib.inherit(GetInitiatorsJob, SubSinksJob);
  GetInitiatorsJob.prototype.destroy = function () {
    this.initiators = null;
    this.username = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  GetInitiatorsJob.prototype.useSubSinks = function () {
    taskRegistry.run('readFromDataSink', {
      sink: this.userssink,
      filter: {
        op: 'eq',
        field: 'username',
        value: this.username
      },
      singleshot: true,
      continuous: false,
      visiblefields:['canSeeInitiators'],
      cb: this.onRequester.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  GetInitiatorsJob.prototype.onRequester = function (canseeobj) {
    if (!this.okToProceed()) {
      return;
    }
    //console.log('onRequester', canseeobj);
    /*
    if (!canseeobj.canSeeInitiators) {
      this.resolve([]);
      return;
    }
    */
    taskRegistry.run('readFromDataSink', {
      sink: this.relationsink,
      filter: {
        op: 'and',
        filters: [{
          op: 'eq',
          field: 'target',
          value: this.username
        },{
          op: 'eq',
          field: 'acceptancetimestamp',
          value: null
        },{
          op: 'gt',
          field: 'initiationtimestamp',
          value: 0
        }]
      },
      singleshot: false,
      continuous: false,
      limit: 10,
      visiblefields:['initiator', 'initiationtimestamp', 'initiationreference'],
      cb: this.onInitiators.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  function ider (initiator) {
    return initiator.initiator;
  }
  GetInitiatorsJob.prototype.onInitiators = function (initiators) {
    if (!this.okToProceed()) {
      return;
    }
    if (!(lib.isArray(initiators) && initiators.length)) {
      this.resolve([]);
      return;
    }
    this.initiators = initiators;
    taskRegistry.run('readFromDataSink', {
      sink: this.userssink,
      filter: {
        op: 'in',
        field: 'username',
        value: initiators.map(ider)
      },
      singleshot: false,
      continuous: false,
      cb: this.onUsers.bind(this),
      errorcb: this.reject.bind(this)
    });
  };
  GetInitiatorsJob.prototype.onUsers = function (users) {
    if (!this.okToProceed()) {
      return;
    }
    this.resolve(users.reduce(this.joinUsersWithInitiators.bind(this), []));
  };
  GetInitiatorsJob.prototype.joinUsersWithInitiators = function (result, user) {
    var m = arrayoperationslib.findElementWithProperty(this.initiators, 'initiator', user.username);
    if (!m) {
      return result;
    }
    user.initiationreference = m.initiationreference;
    result.push(user);
    return result;
  };

  mylib.GetInitiatorsJob = GetInitiatorsJob;
}
module.exports = createGetInitiatorsJob;

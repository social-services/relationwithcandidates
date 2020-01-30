function createFetchProfileJob (execlib, mylib) {
  'use strict';

  var SubSinksJob = mylib.SubSinksJob, 
    lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    execSuite = execlib.execSuite,
    taskRegistry = execSuite.taskRegistry;

  function FetchProfileJob (service, username, defer) {
    SubSinksJob.call(this, service, defer);
    this.username = username;
  }
  lib.inherit(FetchProfileJob, SubSinksJob);
  FetchProfileJob.prototype.destroy = function () {
    this.username = null;
    SubSinksJob.prototype.destroy.call(this);
  };
  FetchProfileJob.prototype.useSubSinks = function () {
    taskRegistry.run('readFromDataSink', {
      sink: this.userssink,
      filter: {
        op: 'eq',
        field: 'username',
        value: this.username
      },
      singleshot: true,
      cb: this.resolve.bind(this),
      errorcb: this.reject.bind(this)
    });
  };

  mylib.FetchProfileJob = FetchProfileJob;
}
module.exports = createFetchProfileJob;

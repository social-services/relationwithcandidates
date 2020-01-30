function createSubSinksJob (lib, mylib) {
  'use strict';

  var q = lib.q,
    qlib = lib.qlib,
    JobOnDestroyable = qlib.JobOnDestroyable;

  function SubSinksJob (service, defer) {
    JobOnDestroyable.call(this, service, defer);
    this.userssink = null;
    this.relationsink = null;
  };
  lib.inherit(SubSinksJob, JobOnDestroyable);
  SubSinksJob.prototype.destroy = function () {
    this.relationsink = null;//no destroy
    this.userssink = null;
    JobOnDestroyable.prototype.destroy.call(this);
  };
  SubSinksJob.prototype.go = function () {
    var ok = this.okToGo();
    if (!ok.ok) {
      return ok.val;
    }
    this.destroyable.subSinksReadyDefer.promise.then(
      this._onSubsinks.bind(this),
      this.reject.bind(this)
    );
    return ok.val;
  };
  SubSinksJob.prototype._onSubsinks = function (subsinks) {
    this.userssink = subsinks[0];
    this.relationsink = subsinks[1];
    this.useSubSinks();
  };

  mylib.SubSinksJob = SubSinksJob;
}
module.exports = createSubSinksJob;

var JobOnDestroyable = qlib.JobOnDestroyable;

function RWCRelationPurger (sink, username1, username2, defer) {
  JobOnDestroyable.call(this, sink, defer);
  this.username1 = username1;
  this.username2 = username2;
}
lib.inherit(RWCRelationPurger, JobOnDestroyable);
RWCRelationPurger.prototype.destroy = function () {
  this.username2 = null;
  this.username1 = null;
  JobOnDestroyable.prototype.destroy.call(this);
};
RWCRelationPurger.prototype.go = function () {
  var ok = this.okToGo();
  if (!ok.ok) {
    return ok.val;
  }
  q.all([
    this.destroyable.call('dropRelation', this.username1, this.username2),
    this.destroyable.call('dropRelation', this.username1, this.username2)
  ]).then(
    this.onPurged.bind(this),
    this.reject.bind(this)
  );
  return ok.val;
};
RWCRelationPurger.prototype.onPurged = function (dels) {
  if (!this.okToProceed()) {
    return;
  }
};



function purgeRWCRelationOnPair(sinkname, username1, username2) {
  return (new RWCRelationPurger(getGlobal(sinkname), username1, username2)).go();
}

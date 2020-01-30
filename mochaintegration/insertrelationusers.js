function UserInserterJob (sink, count, defer) {
  qlib.JobOnDestroyable.call(this, sink, defer);
  this.count = count;
  this.index = 0;
}
lib.inherit(UserInserterJob, qlib.JobOnDestroyable);
UserInserterJob.prototype.destroy = function () {
  this.index = null;
  this.count = null;
  qlib.JobOnDestroyable.prototype.destroy.call(this);
};
UserInserterJob.prototype.go = function () {
  var ok = this.okToGo();
  if (!ok.ok) {
    return ok.val;
  }
  this.insertOne();
  return ok.val;
};
UserInserterJob.prototype.insertOne = function () {
  if (!this.okToProceed()) {
    return;
  }
  if (this.index>=this.count) {
    this.resolve(true);
    return;
  }
  this.createOne().then(
    this.insertOne.bind(this),
    this.reject.bind(this)
  );
};
UserInserterJob.prototype.createOne = function () {
  this.index++;
  if (this.index%1e5===0) {
    console.log('currently at', this.index, 'should be', this.count);
  }
  //return q(true);
  return this.destroyable.call('create', {
    username: 'User'+this.index,
    nick: 'Nick'+this.index,
    picture: (Math.random()<.4 ? (Math.random()<.8 ? 2 : 3) : 1)+'.png',
    /*
    location: {type: 'Point', coordinates: [ 20+4*Math.random(), 40+8*Math.random() ]}
    location: [20+4*Math.random(), 40+8*Math.random()]
    */
    location: randomGeoLocation()
  })
};

function doInsert (usercnt) {
  it('Connect to Users as "user"', function () {
    return setGlobal('UsersUser', Service.subConnect('Users', {role:'user', name: 'user'}));
  });
  it('Insert '+usercnt+' users', function () {
    var ret;
    this.timeout(1e8);
    ret = (new UserInserterJob(UsersUser, usercnt)).go();
    usercnt = null;
    return ret;
  });
}

setGlobal('insertRelationUsers', doInsert);

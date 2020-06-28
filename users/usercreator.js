function createUser(execlib, ParentUser, methoddescriptors, vararglib) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var lib = execlib.lib,
    qlib = lib.qlib,
    userPrototype2ServiceMethodViaMethodDescriptors = vararglib.userPrototype2ServiceMethodViaMethodDescriptors;

  function User(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(User, lib.extend({}, methoddescriptors.service.user, require('../methoddescriptors/user')), ['lastRWCEvent'/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  User.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };

  userPrototype2ServiceMethodViaMethodDescriptors(User.prototype, methoddescriptors.service.user);

  return User;
}

module.exports = createUser;

function createUserSink(execlib, ParentSink, methoddescriptors) {
  'use strict';
  var lib = execlib.lib;

  function UserSink(prophash, client) {
    ParentSink.call(this, prophash, client);
  }
  
  ParentSink.inherit(UserSink, lib.extend({}, methoddescriptors.service.user, require('../methoddescriptors/user')));
  UserSink.prototype.__cleanUp = function () {
    ParentSink.prototype.__cleanUp.call(this);
  };
  return UserSink;
}

module.exports = createUserSink;

function createUser(execlib, ParentUser) {
  'use strict';
  if (!ParentUser) {
    ParentUser = execlib.execSuite.ServicePack.Service.prototype.userFactory.get('user');
  }

  var lib = execlib.lib,
    qlib = lib.qlib;

  function User(prophash) {
    ParentUser.call(this, prophash);
  }
  
  ParentUser.inherit(User, require('../methoddescriptors/user'), ['lastRWCEvent'/*visible state fields here*/]/*or a ctor for StateStream filter*/);
  User.prototype.__cleanUp = function () {
    ParentUser.prototype.__cleanUp.call(this);
  };

  User.prototype.fetchProfile = function (username, defer) {
    qlib.promise2defer(this.__service.fetchProfile(username), defer);
  };

  User.prototype.getCandidates = function (username, filters, defer) {
    qlib.promise2defer(this.__service.getCandidates(username, filters), defer);
  };

  User.prototype.initiateRelation = function (initiatorname, targetname, defer) {
    qlib.promise2defer(this.__service.initiateRelation(initiatorname, targetname), defer);
  };

  User.prototype.blockRelation = function (initiatorname, targetname, defer) {
    qlib.promise2defer(this.__service.blockRelation(initiatorname, targetname), defer);
  };

  User.prototype.getInitiators = function (username, defer) {
    qlib.promise2defer(this.__service.getInitiators(username), defer);
  };

  User.prototype.acceptRelation = function (targetname, initiatorname, defer) {
    qlib.promise2defer(this.__service.acceptRelation(targetname, initiatorname), defer);
  };

  User.prototype.dropRelation = function (initiatorname, targetname, defer) {
    qlib.promise2defer(this.__service.dropRelation(initiatorname, targetname), defer);
  };

  User.prototype.getMatches = function (username, defer) {
    qlib.promise2defer(this.__service.getMatches(username), defer);
  };

  return User;
}

module.exports = createUser;

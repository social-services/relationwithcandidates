(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
ALLEX.execSuite.registry.registerClientSide('social_relationwithcandidatesservice',require('./websinkmapcreator')(ALLEX, ALLEX.execSuite.registry.getClientSide('.'), ALLEX.execSuite.libRegistry.get('social_rwcmethoddescriptorslib')));

},{"./websinkmapcreator":6}],2:[function(require,module,exports){
module.exports = {
};

},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
function createServiceSink(execlib, ParentSink) {
  'use strict';
  function ServiceSink(prophash, client) {
    ParentSink.call(this, prophash, client);
  }
  
  ParentSink.inherit(ServiceSink, require('../methoddescriptors/serviceuser'));
  ServiceSink.prototype.__cleanUp = function () {
    ParentSink.prototype.__cleanUp.call(this);
  };
  return ServiceSink;
}

module.exports = createServiceSink;

},{"../methoddescriptors/serviceuser":2}],5:[function(require,module,exports){
function createUserSink(execlib, ParentSink, methoddescriptors) {
  'use strict';
  var lib = execlib.lib;

  function UserSink(prophash, client) {
    ParentSink.call(this, prophash, client);
  }
  
  console.log('AEL IMAS methoddescriptors?', methoddescriptors);
  ParentSink.inherit(UserSink, lib.extend({}, methoddescriptors, require('../methoddescriptors/user')));
  UserSink.prototype.__cleanUp = function () {
    ParentSink.prototype.__cleanUp.call(this);
  };
  return UserSink;
}

module.exports = createUserSink;

},{"../methoddescriptors/user":3}],6:[function(require,module,exports){
function webSinkMapCreator(execlib, ParentSinkMap, methoddescriptors) {
  'use strict';
  var sinkmap = new (execlib.lib.Map);
  sinkmap.add('service', require('./sinks/servicesinkcreator')(execlib, ParentSinkMap.get('service')));
  sinkmap.add('user', require('./sinks/usersinkcreator')(execlib, ParentSinkMap.get('user'), methoddescriptors));
  
  return sinkmap;
}

module.exports = webSinkMapCreator;

},{"./sinks/servicesinkcreator":4,"./sinks/usersinkcreator":5}]},{},[1]);

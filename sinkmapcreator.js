function sinkMapCreator(execlib, ParentSinkMap, methoddescriptors) {
  'use strict';
  var sinkmap = require('./websinkmapcreator')(execlib, ParentSinkMap, methoddescriptors);
  //add roles that should not be visible to the browser
  return sinkmap;
}

module.exports = sinkMapCreator;

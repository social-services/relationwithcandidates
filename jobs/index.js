function createJobs (execlib) {
  'use strict';

  var lib = execlib.lib,
    ret = {};
  require('./subsinkscreator')(lib, ret);
  require('./fetchprofilecreator')(execlib, ret);
  require('./getcandidatescreator')(execlib, ret);
  require('./relationinitiatorcreator')(execlib, ret);
  require('./relationblockercreator')(execlib, ret);
  require('./getinitiatorscreator')(execlib, ret);
  require('./relationacceptorcreator')(execlib, ret);
  require('./relationdroppercreator')(execlib, ret);
  require('./getmatchescreator')(execlib, ret);

  return ret;
}
module.exports = createJobs;

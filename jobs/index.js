function createJobs (execlib, arrayoperationslib) {
  'use strict';

  var lib = execlib.lib,
    ret = {};
  require('./subsinkscreator')(lib, ret);
  require('./fetchprofilecreator')(execlib, ret);
  require('./getcandidatescreator')(execlib, ret);
  require('./relationinitiatorcreator')(execlib, ret);
  require('./relationblockercreator')(execlib, ret);
  require('./getinitiatorscreator')(execlib, ret, arrayoperationslib);
  require('./relationacceptorcreator')(execlib, ret);
  require('./relationrejectorcreator')(execlib, ret);
  require('./relationdroppercreator')(execlib, ret);
  require('./getmatchescreator')(execlib, ret, arrayoperationslib);

  return ret;
}
module.exports = createJobs;

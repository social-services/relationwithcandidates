function createRelationWithCandidatesService(execlib, ParentService) {
  'use strict';
  

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user')) 
    };
  }

  function RelationWithCandidatesService(prophash) {
    ParentService.call(this, prophash);
  }
  
  ParentService.inherit(RelationWithCandidatesService, factoryCreator);
  
  RelationWithCandidatesService.prototype.__cleanUp = function() {
    ParentService.prototype.__cleanUp.call(this);
  };
  
  return RelationWithCandidatesService;
}

module.exports = createRelationWithCandidatesService;

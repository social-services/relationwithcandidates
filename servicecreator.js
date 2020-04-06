function createRelationWithCandidatesService(execlib, ParentService, StaticServiceContainerMixin, methoddescriptors, vararglib) {
  'use strict';
  
  var lib = execlib.lib,
    q = lib.q,
    qlib = lib.qlib,
    jobs = require('./jobs')(execlib);

  function factoryCreator(parentFactory) {
    return {
      'service': require('./users/serviceusercreator')(execlib, parentFactory.get('service')),
      'user': require('./users/usercreator')(execlib, parentFactory.get('user'), methoddescriptors, vararglib) 
    };
  }

  function subConnectAsUsererSingle (sink) {
    return sink.subConnect('.', {role:'user', name: 'user'});
  }
  function subConnectAsUserer (sinks) {
    return q.all(sinks.map(subConnectAsUsererSingle));
  }
  function RelationWithCandidatesService(prophash) {
    ParentService.call(this, prophash);
    StaticServiceContainerMixin.call(this, {
      USERS_MODULE_NAME: prophash.users_modulename,
      RELATION_INSTANCE_NAME: prophash.relation_instancename,
      RELATION_MODULE_NAME: prophash.relation_modulename || 'social__data_relationwithcandidatesservice',
      USERS_DBNAME: prophash.users_dbname,
      RELATION_DBNAME: prophash.relation_dbname,
      RELATION_TABLE_NAME: prophash.relation_tablename
    });
    this.subSinksReadyDefer = q.defer(); //will be resolved with [usersinktoUsers, usersinktoRelation]
    this.jobs = new qlib.JobCollection();
    q.all([
      this.subservices.waitFor('Users'),
      this.subservices.waitFor(prophash.relation_instancename)
    ]).then(
      subConnectAsUserer
    ).then(
      this.subSinksReadyDefer.resolve.bind(this.subSinksReadyDefer)
    );
  }
  
  ParentService.inherit(RelationWithCandidatesService, factoryCreator);
  StaticServiceContainerMixin.addMethods(RelationWithCandidatesService);
  
  RelationWithCandidatesService.prototype.__cleanUp = function() {
    if (this.jobs) {
      this.jobs.destroy();
    }
    this.jobs = null;
    if (this.subSinksReadyDefer) {
      this.subSinksReadyDefer.reject(new lib.Error('ALREADY_DYING', 'This instance of '+this.constructor.name+' is under destruction'));
    }
    this.subSinksReadyDefer = null;
    StaticServiceContainerMixin.prototype.destroy.call(this);
    ParentService.prototype.__cleanUp.call(this);
  };

  RelationWithCandidatesService.prototype.isInitiallyReady = function(prophash){
    return false;
  };

  RelationWithCandidatesService.prototype.fetchProfile = function (username, filterobj) {
    return this.jobs.run('.', new jobs.FetchProfileJob(this, username, filterobj)); //queued version (if we had this.jobs = new qlib.JobCollection();)
  };
  
  RelationWithCandidatesService.prototype.getCandidates = function (username, filters) {
    //return (new jobs.GetCandidatesJob(this, username, filters)).go(); //non-queued version
    return this.jobs.run('.', new jobs.GetCandidatesJob(this, username, filters)); //queued version (if we had this.jobs = new qlib.JobCollection();)
  };
  
  RelationWithCandidatesService.prototype.initiateRelation = function (initiatorname, targetname) {
    return this.jobs.run('.', new jobs.InitiateRelationJob(this, initiatorname, targetname));
  };

  RelationWithCandidatesService.prototype.blockRelation = function (initiatorname, targetname) {
    return this.jobs.run('.', new jobs.BlockRelationJob(this, initiatorname, targetname));
  };

  RelationWithCandidatesService.prototype.getInitiators = function (username) {
    return this.jobs.run('.', new jobs.GetInitiatorsJob(this, username));
  };

  RelationWithCandidatesService.prototype.acceptRelation = function (targetname, initiatorname) {
    return this.jobs.run('.', new jobs.AcceptRelationJob(this, targetname, initiatorname, false));
  };

  RelationWithCandidatesService.prototype.dropRelation = function (initiatorname, targetname) {
    return this.jobs.run('.', new jobs.DropRelationJob(this, initiatorname, targetname));
  };

  RelationWithCandidatesService.prototype.getMatches = function (username) {
    console.log('oli getMatches?', username);
    return this.jobs.run('.', new jobs.GetMatchesJob(this, username));
  };

  RelationWithCandidatesService.prototype.announceRWCEvent = function (evnt) {
    this.state.set('lastRWCEvent', evnt);
  };

  RelationWithCandidatesService.prototype.servicesToStartStatically = [{
		"modulename": "USERS_MODULE_NAME",
		"instancename": "Users",
    "propertyhash": {
      "storage": {
        "modulename": "allex_mongostorage",
        "propertyhash": {
          "server": "127.0.0.1",
          "database": "USERS_DBNAME",
          "table": "users"
        }
      }
    }
  },{
		"modulename": "RELATION_MODULE_NAME",
		"instancename": "RELATION_INSTANCE_NAME",
    "propertyhash": {
      "storage": {
        "modulename": "allex_mongostorage",
        "propertyhash": {
          "_nativeid": true,
          "server": "127.0.0.1",
          "database": "RELATION_DBNAME",
          "table": "RELATION_TABLE_NAME"
        }
      }
    }
  }];

  RelationWithCandidatesService.prototype.propertyHashDescriptor = {
    users_modulename: {type: 'string'},
    relation_instancename: {type: 'string'},
    users_dbname: {type: 'string'},
    relation_dbname: {type: 'string'},
    relation_tablename: {type: 'string'}
  };
  
  return RelationWithCandidatesService;
}

module.exports = createRelationWithCandidatesService;

var _usercnt = 1e1,
  _doInsert = 0,
  _firstRelationInserterInclusively = 290,
  _lastRelationInserterExclusively = 300,
  _relationsPerInserter = 10,
  _acceptanceProbability = 1
  ;

var _targetedUsers = [];

describe('Test Service', function () {
  loadMochaIntegration('social_relationwithcandidatesservice');
  it('Start Service', function () {
    this.timeout(1e8);
    return setGlobal('Service', startService({
      modulename: 'social_relationwithcandidatesservice',
      instancename: '.',
      propertyhash: {
        users_modulename: 'social__data_userservice',
        relation_instancename: 'Matches',
        users_dbname: 'matchtest',
        relation_dbname: 'matchtest',
        relation_tablename: 'matches'
      }
    }));
  });
  it('Connect as "user"', function () {
    return setGlobal('User', Service.subConnect('.', {role:'user', name: 'user'}));
  });
  it('Start listening for events', function () {
    taskRegistry.run('readState', {
      state: taskRegistry.run('materializeState', {
        sink: User
      }),
      name: 'lastRWCEvent',
      cb: console.log.bind(console, 'lastRWCEvent')
    });
  });
  if (_doInsert) {
    insertRelationUsers(_usercnt);
  }
  /*
  it('Fetch profile', function () {
    return qlib.promise2console(User.call('fetchProfile', 'User2'), 'fetchProfile');
  });
  */
  it('User0 drops with User1', function () {
    return qlib.promise2console(User.call('dropRelation', 'User0', 'User1'), 'dropRelation');
  });
  it('User1 drops with User0', function () {
    return qlib.promise2console(User.call('dropRelation', 'User1', 'User0'), 'dropRelation');
  });
  it('User0 initiates with User1', function () {
    return qlib.promise2console(User.call('initiateRelation', 'User0', 'User1'), 'initiateRelation');
  });
  it('User1 initiates with User0', function () {
    return qlib.promise2console(User.call('initiateRelation', 'User1', 'User0'), 'initiateRelation');
  });
  for (i=_firstRelationInserterInclusively; i<_lastRelationInserterExclusively; i++) {
    initiateRelations('User', 'User'+i, _relationsPerInserter, _targetedUsers, _acceptanceProbability);
  }
  lookAtInstantiationsAndAccept('User', _targetedUsers);
  /*
  */
  it('Close service', function () {
    Service.destroy();
  });
});

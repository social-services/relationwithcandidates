module.exports = {
  fetchProfile: [{
    title: 'User Name',
    type: 'string'
  }],
  getCandidates: [{
    title: 'User Name',
    type: 'string'
  },{
    title: 'Filter',
    type: ['array', 'null']
  }],
  initiateRelation: [{
    title: 'Initiator Name',
    type: 'string'
  },{
    title: 'Target Name',
    type: 'string'
  }],
  blockRelation: [{
    title: 'Initiator Name',
    type: 'string'
  },{
    title: 'Target Name',
    type: 'string'
  }],
  getInitiators: [{
    title: 'User Name',
    type: 'string'
  }],
  acceptRelation: [{
    title: 'Target name',
    type: 'string'
  },{
    title: 'Initiator name',
    type: 'string'
  }],
  dropRelation: [{
    title: 'Initiator Name',
    type: 'string'
  },{
    title: 'Target Name',
    type: 'string'
  }],
  getMatches: [{
    title: 'User Name',
    type: 'string'
  }]
};

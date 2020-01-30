function createServicePack(execlib) {
  'use strict';
  return {
    service: {
      dependencies: ['.','allex:staticservicecontainer:lib']
    },
    sinkmap: {
      dependencies: ['.']
    }, /*
    tasks: {
      dependencies: []
    }
    */
  }
}

module.exports = createServicePack;

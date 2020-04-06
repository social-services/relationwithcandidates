function createServicePack(execlib) {
  'use strict';
  return {
    service: {
      dependencies: ['.','allex:staticservicecontainer:lib', 'social:rwcmethoddescriptors:lib', 'allex:varargfunctionhandler:lib']
    },
    sinkmap: {
      dependencies: ['.', 'social:rwcmethoddescriptors:lib']
    }, /*
    tasks: {
      dependencies: []
    }
    */
  }
}

module.exports = createServicePack;

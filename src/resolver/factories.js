var jpexError = require('../jpexError');
var constants = require('../constants');

exports.getFactory = function (Class, name, optional) {
  var factory = Class.$$resolved[name];

  if (!isValidFactory(factory)){
    factory = Class.$$factories[name];

    if (!isValidFactory(factory)){
      factory = Class.$$getFromNodeModules(name);

      if (!isValidFactory(factory)){
        if (optional){
          return;
        }else{
          jpexError(['Unable to find required dependency', name].join(' '));
        }
      }
    }
  }

  return factory;
};

exports.cacheResult = function (Class, name, factory, value, namedParameters) {
  switch(factory.lifecycle){
  case constants.APPLICATION:
    factory.resolved = true;
    factory.value = value;
    break;
  case constants.CLASS:
    Class.$$resolved[name] = {
      resolved : true,
      value : value
    };
    break;
  case constants.NONE:
    break;
  case constants.INSTANCE:
  default:
    namedParameters[name] = value;
    break;
  }
};

function isValidFactory(factory) {
  return factory && ((factory.fn && typeof factory.fn === 'function') || factory.constant || factory.resolved);
}

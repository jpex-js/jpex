var jpexError = require('../jpexError');
var constants = require('../constants');

exports.getFactory = function (Class, name, optional) {
  var factory;

  Class.$trigger('getFactory', {
    Class : Class,
    factoryName : name,
    set : function (value) {
      factory = value;
    }
  });

  if (!isValidFactory(factory)){
    factory = Class.$$resolved[name];

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
  }

  return factory;
};

exports.decorate = function (Class, value, decorators) {
  if (!decorators || !decorators.length){
    return value;
  }
  for (var x = 0, l = decorators.length; x < l; x++){
    value = decorators[x].call(Class, value);
  }
  return value;
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

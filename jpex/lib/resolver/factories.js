var jpexError = require('../jpexError');
// Get the factory from the class factories (which will also scan the parent classes)
exports.getFactory = function(Class, name, optional){
  var factory = Class._resolved[name];

  if (!isValidFactory(factory)){
    factory = Class._factories[name];

    if (!isValidFactory(factory)){
      factory = Class._getFileFromFolder(name);

      if (!isValidFactory(factory)){
        factory = Class._getFromNodeModules(name);

        if (!isValidFactory(factory)){
          if (optional){
            return undefined;
          }
          jpexError(['Unable to find required dependency:', name].join(' '));
        }
      }
    }
  }

  return factory;
};

exports.cacheResult = function(Class, name, factory, value, namedParameters){
  switch(factory.lifecycle){
    case 1: //singleton
      factory.resolved = true;
      factory.value = value;
      break;
    case 2: //class
      Class._resolved[name] = {
        resolved : true,
        value : value
      };
      break;
    case 4: //none
      break;
    default: //instance
      namedParameters[name] = value;
      break;
  }
  return namedParameters;
};

// Check if the factory is valid
function isValidFactory(factory){
  return factory && ((factory.fn && typeof factory.fn === 'function') || factory.constant || factory.resolved);
}

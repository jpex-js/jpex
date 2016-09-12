// Get the factory from the class factories (which will also scan the parent classes)
exports.getFactory = function(Class, name, optional){
  var factory = Class._getDependency(name);
  
  if (!isValidFactory(factory)){
    factory = Class._getFileFromFolder(name);

    if (!isValidFactory(factory)){
      factory = Class._getFromNodeModules(name);

      if (!isValidFactory(factory)){
        if (optional){
          return undefined;
        }
        throw new Error(['Unable to find required dependency:', name].join(' '));
      }
    }
  }
  
  return factory;
};

// Check if the factory is valid
function isValidFactory(factory){
  return factory && ((factory.fn && typeof factory.fn === 'function') || factory.constant);
}
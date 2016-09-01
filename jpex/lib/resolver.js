exports.extractParameters = function(fn){
  var reg_comments = /\/\*(.*)\*\//g,
      chr_open = '(',
      chr_close = ')',
      chr_arrow = '=>',
      chr_delimeter = ',';

  // Remove comments
  var str = fn.toString().replace(reg_comments, '');
  
  // Find the start and end of the function parameters
  var open = str.indexOf(chr_open);
  var close = str.indexOf(chr_close);
  var arrow = str.indexOf(chr_arrow);
  
  // Arrow functions be declared with no brackets
  if (arrow > -1 && (arrow < open || open < 0)){
      str = str.substring(0, arrow).trim();
      return str ? [str] : [];
  }
  
  // Pull out the parameters and split into an array
  str = str.substring(open + 1, close);
  return str ? str.split(chr_delimeter).map((s) => s.trim()) : [];
};

//------------------------------------------------------------

// Resolve all dependencies for a class
exports.resolveDependencies = function(Class, definition, namedParameters){
  return resolveMany(Class, definition, namedParameters);
};

// Resolve a single dependency for a class
exports.resolve = function(Class, name, namedParameters){
  var definition = {dependencies : [name]};
  return resolveMany(Class, definition, namedParameters);
};

// Resolves all dependencies for a factory
function resolveMany(Class, definition, namedParameters, globalOptions, stack){
  if (!definition || !definition.dependencies){
    return [];
  }
  if (!stack){
    stack = [];
  }
  
  var args = [].concat(definition.dependencies).map(name => {
    if (typeof name === 'object'){
      return Object.keys(name).map(key => resolveDependency(Class, key, name[key], namedParameters, stack));
    }else{
      return [resolveDependency(Class, name, globalOptions, namedParameters, stack)];
    }
  });
  
  return Array.prototype.concat.apply([], args);
}

// Resolves a single dependency
function resolveDependency(Class, name, localOptions, namedParameters, stack){
  var optional = checkOptional(name);
  if (optional){
    name = optional;
    optional = true;
  }
  
  // Special cases
  if (name === '$options'){
    return localOptions;
  }
  if (name === '$namedParameters'){
    return namedParameters;
  }
  if (namedParameters && namedParameters[name] !== undefined){
    return namedParameters[name];
  }
  
  // Check for recursive loop
  if (stack.indexOf(name) > -1){
    throw new Error(['Recursive loop for dependency', name, 'encountered'].join(' '));
  }
  
  // Get the factory. If it returns null with no error, it must be optional so just return it
  var factory = getFactory(Class, name, optional);
  if (!factory){
    return factory;
  }
  
  // Constant values don't need any more calculations
  if (factory.constant){
    return decorateResult(Class, name, namedParameters, localOptions, factory.value);
  }
  
  var args;
  
  //Get the dependency's dependencies
  if (factory.dependencies && factory.dependencies.length){
    try{
      args = resolveMany(Class, factory, namedParameters, localOptions, stack.concat(name));
    }
    catch(e){
      if (optional){
        return undefined;
      }
      throw e;
    }
  }

  //Run the factory function and return the result
  var result = factory.fn.apply(this, args); 
  
  return decorateResult(Class, name, namedParameters, localOptions, result);
}

// Check for _name_ syntax
function checkOptional(name){
  if (name[0] === '_'){
    var arr = name.split('_');
    if (arr[arr.length-1] === ''){
      arr.shift();
      arr.pop();
      name = arr.join('_');
      return name;
    }
  }
  return false;
}

// Get the factory from the class factories (which will also scan the parent classes)
function getFactory(Class, name, optional){
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
}

// Check if the factory is valid
function isValidFactory(factory){
  return factory && ((factory.fn && typeof factory.fn === 'function') || factory.constant);
}

// Runs any decorators against the dependency
function decorateResult(Class, name, namedParameters, localOptions, result){
  var decorators = Class._getDecorators(name);
  
  if (decorators && decorators.length){
    decorators.forEach((decorator) => {
      var args;
      if (decorator.dependencies && decorator.dependencies.length){
        args = resolveMany(Class, decorator, namedParameters, localOptions);
      }
      result = decorator.fn.apply(result, args);
    });
  }
  
  return result;
}
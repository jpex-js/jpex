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
  var ancestoral = checkAncestoral(name);
  if (ancestoral){
    name = ancestoral;
    if (Class._parent){
      return resolveDependency(Class._parent, name, localOptions, namedParameters, []);
    }
  }
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
    validateInterface(Class, name, namedParameters[name]);
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
    if (!factory.valid){
      validateInterface(Class, name, factory.value);
      factory.valid = true;
    }
    return factory.value;
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
  
  validateInterface(Class, name, result);
  
  return result;
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

// Check ancestoral
function checkAncestoral(name){
  if (name[0] === '^'){
    return name.substr(1);
  }
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

function validateInterface(Class, name, value){
  var interface = Class._getInterface(name);
  if (interface === null){
    return true;
  }
  var stack = crossReferenceInterface(Class, interface, value);
  
  if (stack){
    var message = ['Factory', name, 'does not match interface pattern.'].concat(stack).join(' ');
    throw new Error(message);
  }
}

function crossReferenceInterface(Class, interface, obj){
  var stack = [];
  var itype = Class.Typeof(interface);
  var otype = Class.Typeof(obj);
  
  if (itype === 'null'){
    // Any type accepted
    return;
  }
  
  if (itype === 'array' && interface.iCanBeEither){
    // Value can be any value in the array
    for (var z = 0; z < interface.length; z++){
      var t = crossReferenceInterface(Class, interface[z], obj);
      if (t){
        stack.push(Class.Typeof(interface[z]));
      }else{
        return;
      }
    }
    return [stack.join('/')];
  }
  
  if (itype !== otype){
    // Type mismatch
    stack.push('Not a', itype);
    return stack;
  }
  
  switch(itype){
    case 'function':
    case 'object':
      var keys = Object.keys(interface);
      for (var x = 0, l = keys.length; x < l; x++){
        var key = keys[x];
        var result = crossReferenceInterface(Class, interface[key], obj[key]);
        if (result){
          stack = stack.concat([key, ':']).concat(result);
        }
      }
      break;
      
    case 'array':
      if (!interface.length || !obj.length){
        //Empty
        return;
      }
      interface = interface[0];
      for (var y = 0; y < obj.length; y++){
        var result = crossReferenceInterface(Class, interface, obj[y]);
        if (result){
          stack = stack.concat(result);
        }
      }
      break;
  }
  
  if (stack.length){
    return stack;
  }
}
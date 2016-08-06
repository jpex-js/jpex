var statics = require('./statics'),
    grequire = require('./grequire');

exports.getDependency = getDependency;
exports.getFileFromFolder = getFileFromFolder;
exports.getFromNodeModules = getFromNodeModules;
exports.resolveDependencies = resolveDependencies;
exports.namedParameters = namedParameters;
exports.invokeParent = invokeParent;
exports.extractParameters = extractParameters;

//------------------------------------------------------------

function getDependency (parentClass, name){
  if (this._factories[name]){
    return this._factories[name];
  }
  if (parentClass._getDependency){
    return parentClass._getDependency(name);
  }
  return null;
}

//------------------------------------------------------------

function getFileFromFolder(parentClass, name){
  for (var x = 0; x < this._folders.length; x++){
    try{
      var result = grequire(this._folders[x] + '/' + name);
      this.Register.Constant(name, result);
      return this._factories[name];
    }
    catch(e){
    }
  }
  
  if (parentClass._getFileFromFolder){
    return parentClass._getFileFromFolder(name);
  }
  
  return null;
}

//------------------------------------------------------------

function getFromNodeModules(name){
  try{
    var result = require(name);
    this.Register.Constant(name, result);
    return this._factories[name];
  }
  catch(e){
  }
}

//------------------------------------------------------------

function resolveDependencies(theClass, obj, namedParameters, globalOptions, stack){
  if (!(obj && obj.dependencies)){
    return [];
  }
  if (!stack){
    stack = [];
  }
  
  var args = [].concat(obj.dependencies).map(resolveDependency);
  
  return Array.prototype.concat.apply([], args);
  
  function resolveDependency(name){
    if (typeof name === 'object'){
      return Object.keys(name).map(key => dothework(key, name[key]));
    }else{
      return [dothework(name, globalOptions)];
    }
  }
  
  function dothework(name, localOptions){
    // Optional?
    var optional = false;
    if (name[0] === '_'){
      var arr = name.split('');
      if (arr[arr.length-1] === '_'){
        optional = true;
        arr.shift();
        arr.pop();
        name = arr.join('');
      }
    }
    
    // Special case for options
    if (name === '$options'){
      return localOptions;
    }
    if (name === '$namedParameters'){
      return namedParameters;
    }
    
    // Named parameters
    if (namedParameters && namedParameters[name] !== undefined){
      return namedParameters[name];
    }
    
    // Check for infinite recursion
    if (stack.indexOf(name) > -1){
      throw new Error(['Recursive loop for dependency', name, 'encountered'].join(' '));
    }
    
    // Get the factory from the class factories (which will also scan the parent classes)
    var factory = theClass._getDependency(name);
    
    if (!(factory && factory.fn && typeof factory.fn === 'function')){
      factory = theClass._getFileFromFolder(name);
    }
    
    if (!(factory && factory.fn && typeof factory.fn === 'function')){
      factory = theClass._getFromNodeModules(name);
    }
    
    if (!(factory && factory.fn && typeof factory.fn === 'function')){
      if (optional){
        return undefined;
      }
      throw new Error(['Unable to find required dependency:', name].join(' '));
    }
    
    //Get the dependency's dependencies
    try{
      var args = resolveDependencies(theClass, factory, namedParameters, localOptions, stack.concat(name));
    }
    catch(e){
      if (optional){
        return undefined;
      }
      throw e;
    }
    
    //Run the factory function and return the result
    return factory.fn.apply(this, args);
  }
}

//------------------------------------------------------------

function namedParameters(keys, values, args){
  if (statics.Typeof(args) !== 'object'){
    args = {};
  }
  
  var i = 0;

  if (keys && values){
    keys.forEach(function(key){
      if (typeof key === 'object'){
        Object.keys(key).forEach(function(key){
          if (args[key] === undefined && values[i] !== undefined){
            args[key] = values[i];
          }
          i++;
        });
      }else{
        if (args[key] === undefined && values[i] !== undefined){
          args[key] = values[i];
        }
        i++;
      }
    });
  }
  
  return args;
}

//------------------------------------------------------------

function invokeParent(parentClass, keys,instance, values, args){
  args = namedParameters(keys, values, args);
  
  parentClass.call(instance, args);
}

//------------------------------------------------------------

function extractParameters(fn){
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
  return str ? str.split(chr_delimeter).map(s => s.trim()) : [];
}
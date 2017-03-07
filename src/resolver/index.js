var factoryService = require('./factories');
var jpexError = require('../jpexError');

exports.extractParameters = function (fn) {
  var reg_comments = /\/\*(.*)\*\//g,
    chr_open = '(',
    chr_close = ')',
    chr_arrow = '=>',
    chr_delimeter = ',';

  var str = fn.toString();

  // Remove comments
  str = str.replace(reg_comments, '');

  // Find the start and end of the parameters
  var open = str.indexOf(chr_open);
  var close = str.indexOf(chr_close);
  var arrow = str.indexOf(chr_arrow);

  // Arrow functions may not contain brackets
  if (arrow > -1 && (arrow < open || open < 0)){
    str = str.substring(0, arrow).trim();
    return str ? [str] : [];
  }

  // Pull out the parameters and split into an array
  str = str.substring(open + 1, close);
  return str ? str.split(chr_delimeter).map(function (s) {
    return s.trim();
  }) : [];
};

exports.resolveDependencies = function (Class, definition, namedParameters) {
  return resolveMany(Class, definition, namedParameters);
};

exports.resolve = function (Class ,name, namedParameters) {
  return resolveDependency(Class, name, null, namedParameters, []);
};

function resolveMany(Class, definition, namedParameters, globalOptions, stack) {
  if (!definition || !definition.dependencies){
    return [];
  }
  if (!stack){
    stack = [];
  }
  if (!namedParameters){
    namedParameters = {};
  }

  var args = [].concat(definition.dependencies).map(function (name) {
    if (typeof name === 'object'){
      return Object.keys(name).map(function (key) {
        return resolveDependency(Class, key, name[key], namedParameters, stack);
      });
    }else{
      return [resolveDependency(Class, name, globalOptions, namedParameters, stack)];
    }
  });

  return Array.prototype.concat.apply([], args);
}

function resolveDependency(Class, name, localOptions, namedParameters, stack) {
  var factory;

  if (!namedParameters){
    namedParameters = {};
  }

  // Special cases
  switch(name){
  case '$options':
    return localOptions;
  case '$namedParameters':
    return namedParameters;
  }

  // Optional dependency
  var optional = exports.checkOptional(name);
  if (optional){
    name = optional;
    optional = true;
  }

  // Check named Parameters
  if (Object.hasOwnProperty.call(namedParameters, name)){
    return namedParameters[name];
  }

  // Check for recursive loop
  if (stack.indexOf(name) > -1){
    jpexError(['Recursive loop for dependency', name, 'encountered'].join(' '));
  }

  // Get the factory. If it returns null with no error, it must be optional
  factory = factoryService.getFactory(Class, name, optional);
  if (!factory){
    return factory;
  }

  // Check if already resolved
  if (factory.resolved){
    return factory.value;
  }

  // Constant values don't need any more evaluation
  if (factory.constant){
    var value = factory.value;
        // Process decorators
    value = factoryService.decorate(Class, value, factory.decorators);
        // Cache the result
    factoryService.cacheResult(Class, name, factory, value, namedParameters);

    return value;
  }

  // Work out arguments
  var args;

  if (factory.dependencies && factory.dependencies.length){
    try{
      args = resolveMany(Class, factory, namedParameters, localOptions, stack.concat(name));
    }catch(e){
      if (optional){
        return;
      }else{
        throw e;
      }
    }
  }

  // Run the factory function
  var result = factory.fn.apply(Class, args);

    // Process decorators
  result = factoryService.decorate(Class, result, factory.decorators);

    // Cache the result
  factoryService.cacheResult(Class, name, factory, result, namedParameters);

  return result;
}

exports.checkOptional = function (name) {
  if (name[0] === '_' && name[name.length-1] === '_'){
    return name.substring(1, name.length-1);
  }else{
    return false;
  }
};

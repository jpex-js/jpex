(function(){
  var __jpex_modules__ = [];
  __jpex_modules__[5] = function(require, module, exports){
  module.exports = function(mess){
  var e = new Error(mess);
  e.jpexInternalError = true;
  throw e;
};

};

__jpex_modules__[6] = function(require, module, exports){
  exports.APPLICATION = 1;
exports.CLASS = 2;
exports.INSTANCE = 3;
exports.NONE = 4;

};

__jpex_modules__[4] = function(require, module, exports){
  var jpexError = require(5);
var constants = require(6);

exports.getFactory = function (Class, name, optional) {
  var factory = Class.$resolved[name];

  if (!isValidFactory(factory)){
    factory = Class.$factories[name];

    if (!isValidFactory(factory)){
      factory = Class.$getFromNodeModules(name);

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
    Class.$resolved[name] = {
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

};

__jpex_modules__[3] = function(require, module, exports){
  var factoryService = require(4);
var jpexError = require(5);

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

  // Resolve the dependency using the parent class
  var ancestoral = checkAncestoral(name);
  if (ancestoral){
    name = ancestoral;
    return resolveDependency(Class.$parent, name, localOptions, namedParameters, []);
  }

  // Optional dependency
  var optional = checkOptional(name);
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

  factoryService.cacheResult(Class, name, factory, result, namedParameters);

  return result;
}

function checkOptional(name) {
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

function checkAncestoral(name) {
  return name[0] === '^' && name.substr(1);
}

};

__jpex_modules__[8] = function(require, module, exports){
  var _process;

try{
  _process = eval('process');
}catch(e){}

module.exports = typeof _process === 'object' && _process.toString() === '[object process]';

};

__jpex_modules__[9] = function(require, module, exports){
  exports.use = function (plugin) {
  var Jpex = this;

  if (!plugin || !plugin.install || typeof plugin.install !== 'function'){
    throw new Error('Plugin does not have an install method');
  }

  var options = {
    Jpex : Jpex,
    on : function (name, fn) {
      addHook(Jpex, name, fn);
    }
  };

  plugin.install(options);
};

exports.trigger = function (name, payload) {
  var hook = this.$hooks[name];
  if (!hook){
    return;
  }

  hook.trigger(payload);
};

function addHook(Class, name, fn) {
  var hooks = Class.$hooks;

  if (!hooks[name]){
    var id = 0;
    var Parent = Class;
    while (Parent.$parent && Parent.$parent.$parent){
      Parent = Parent.$parent;
    }
    Parent.$hooks[name] = Object.create({
      push : function (fn) {
        this[id++] = fn;
      },
      trigger : function (payload) {
        payload = Object.assign({ Jpex : Class, eventName : name }, payload);
        Array.prototype.slice.call(this).forEach(function (fn) {
          fn(payload);
        });
      }
    }, {
      length : {
        get : function () {
          return id;
        }
      }
    });
  }
  if (!Object.hasOwnProperty.call(hooks, name)){
    hooks[name] = Object.create(Class.$parent.$hooks[name] || null);
  }
  hooks[name].push(fn);
}

};

__jpex_modules__[7] = function(require, module, exports){
  var isNode = require(8);
var triggerHook = require(9).trigger;

function getFromNodeModules(name) {
  if (!isNode){
    return;
  }
  // In order to stop webpack and browserify from requiring every possible file, we have to wrap the require statement in an eval
  try{
    var result = eval('require.main.require(name)');
    this.register.constant(name, result);
    return this.$factories[name];
  }catch(e){
    if (!(e && e.message && e.message.substr(0, 6) === 'Cannot')){
      throw e;
    }
  }
}
function namedParameters(keys, values, args) {
  if (!args || typeof args !== 'object'){
    args = {};
  }

  var i = 0;
  if (keys && values){
    keys.forEach(function (key) {
      if (typeof key === 'object'){
        Object.keys(key).forEach(function (key) {
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
function invokeParent(instance, values, args) {
  if (values && !Array.isArray(values)){
    values = Array.prototype.slice.call(values);
  }
  args = this.$namedParameters(values, args);
  var Parent = this.$parent;
  Parent.call(instance, args);
}

module.exports = function (Parent, Class, options) {
  Object.defineProperties(Class, {
    $getFromNodeModules : {
      value : getFromNodeModules
    },
    $namedParameters : {
      value : namedParameters.bind(null, options.dependencies)
    },
    $invokeParent : {
      value : invokeParent
    },
    $trigger : {
      value : triggerHook
    },
    $parent : {
      get : function () {
        return Parent;
      }
    },
    $factories : {
      writable : true,
      value : Object.create(Parent.$factories || null)
    },
    $resolved : {
      writable : true,
      value : Object.create(Parent.$interfaces || null)
    },
    $config : {
      writable : true,
      value : Object.assign(Object.create(Parent.$config || null), options.config)
    },
    $hooks : {
      writable : true,
      value : Object.create(Parent.$hooks || null)
    }
  });

  // PRIVATES HOOK
  Class.$trigger('privateProperties', {
    Class : Class,
    options : options,
    apply : function (opt) {
      var properties = {};
      Object.keys(opt).forEach(function (key) {
        var prop = { configurable : false, enumerable : false };
        var def = opt[key];
        if (def && def.get && typeof def.get === 'function'){
          prop.get = def.get;
        }
        if (def && def.set && typeof def.set === 'function'){
          prop.set = def.set;
        }
        if (!prop.get && !prop.set){
          prop.value = def;
          prop.writable = true;
        }
        properties[key] = prop;
      });

      Object.defineProperties(Class, properties);
    }
  });
};

};

__jpex_modules__[12] = function(require, module, exports){
  var constants = require(6);

module.exports = function (factory) {
  var wrapper = {
    lifecycle : {
      application : function () {
        factory.lifecycle = constants.APPLICATION;
        return wrapper;
      },
      class : function () {
        factory.lifecycle = constants.CLASS;
        return wrapper;
      },
      instance : function () {
        factory.lifecycle = constants.INSTANCE;
        return wrapper;
      },
      none : function () {
        factory.lifecycle = constants.NONE;
        return wrapper;
      }
    }
  };

  // WRAPPER HOOKS

  return wrapper;
};

};

__jpex_modules__[11] = function(require, module, exports){
  var wrapper = require(12);

module.exports = function (name, obj) {
  var f = { value : obj, constant : true };
  this.$factories[name] = f;
  return wrapper(f).lifecycle.application();
};

};

__jpex_modules__[13] = function(require, module, exports){
  var extractParameters = require(3).extractParameters;
var wrapper = require(12);

module.exports = function (name, dependencies, fn) {
  if (typeof dependencies === 'function'){
    fn = dependencies;
    dependencies = null;
  }
  if (typeof fn !== 'function'){
    throw new Error('Factory ' + name + ' - fn must be a [Function]');
  }

  if (dependencies){
    dependencies = [].concat(dependencies);
  }else{
    dependencies = extractParameters(fn);
  }
  if (!dependencies.length){
    dependencies = null;
  }

  var f = {
    fn : fn,
    dependencies : dependencies
  };
  this.$factories[name] = f;
  return wrapper(f).lifecycle.instance();
};

};

__jpex_modules__[15] = function(require, module, exports){
  module.exports = function(context, args){
  return new (Function.prototype.bind.apply(context, args));
};

};

__jpex_modules__[16] = function(require, module, exports){
  // Jpex As A Service
module.exports = function (name, dependencies, Fn) {
  dependencies = dependencies ? [].concat(dependencies) : [];
  dependencies.unshift('$namedParameters');

  function factory() {
    var args = Array.prototype.slice.call(arguments);

    var params = {};

    // Get factory dependencies
    var i = 1;
    dependencies.forEach(function (key, index) {
      if (typeof key === 'object'){
        Object.keys(key).forEach(function (key2) {
          var val = args[i++];
          if (val !== undefined){
            params[key2] = val;
          }
        });
      }else{
        var val = args[i++];
        if (val !== undefined){
          params[key] = val;
        }
      }
    });

    // Get named dependencies
    if (args[0] && typeof args[0] === 'object'){
      Object.keys(args[0]).forEach(function (key) {
        var val = args[0][key];
        if (val !== undefined){
          params[key] = val;
        }
      });
    }

    return new Fn(params);
  }

  var service = this.register.factory(name, dependencies, factory);

  return service;
};

};

__jpex_modules__[14] = function(require, module, exports){
  var extractParameters = require(3).extractParameters;
var instantiator = require(15);
var jaas = require(16);

module.exports = function (name, dependencies, fn) {
  if (typeof dependencies === 'function'){
    fn = dependencies;
    dependencies = null;
  }

  if (typeof fn !== 'function'){
    throw new Error('Service ' + name + ' - fn must be a [Function]');
  }

  if (fn.extend && fn.register && fn.register.factory){
    return jaas.call(this, name, dependencies, fn);
  }

  if (dependencies){
    dependencies = [].concat(dependencies);
  }else{
    dependencies = extractParameters(fn);
  }

  function factory() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift({});
    return instantiator(fn, args);
  }

  return this.register.factory(name, dependencies, factory);
};

};

__jpex_modules__[17] = function(require, module, exports){
  module.exports = function (name) {
  return this.register.factory(name, [], function () {
    return eval('require(name)');
  }).lifecycle.application();
};

};

__jpex_modules__[10] = function(require, module, exports){
  var constant = require(11);
var factory = require(13);
var service = require(14);
var nodeModule = require(17);

module.exports = function (Class, options) {
  var register = function () {
    return register.factory.apply(Class, arguments);
  };
  register.constant = constant.bind(Class);
  register.factory = factory.bind(Class);
  register.service = service.bind(Class);
  register.nodeModule = nodeModule.bind(Class);

  // FACTORY HOOKS
  Class.$trigger('factories', {
    Class : Class,
    options : options,
    register : function (name, fn) {
      register[name] = fn.bind(Class);
    }
  });

  Object.defineProperty(Class, 'register', {
    value : register
  });
};

};

__jpex_modules__[18] = function(require, module, exports){
  var resolver = require(3);

module.exports = function (Jpex) {
  Jpex.register.factory('$resolve', [], function () {
    var TheClass = this;
    return function (name, namedParameters) {
      return resolver.resolve(TheClass, name, namedParameters);
    };
  }).lifecycle.class();
};

};

__jpex_modules__[2] = function(require, module, exports){
  var resolver = require(3);
var privates = require(7);
var factories = require(10);
var plugins = require(9);

module.exports = function () {
  // Start with a basic function constructor
  var Base = function(){};
  Base.extend = extend;
  Base.use = plugins.use;

  // Extend the vanilla constructor to apply all the jpex-ness
  var Jpex = Base.extend();

  // Add the only default factory, $resolve
  require(18)(Jpex);

  return Jpex;
};

function extend(options) {
  var Parent = this;
  options = createOptions(Parent, options);

  var Class = createClass(Parent, options);

  privates(Parent, Class, options);
  factories(Class, options);

  // EXTEND HOOK
  if (Parent.$trigger){
    Parent.$trigger('extend', {
      Class : Class,
      options : options
    });
  }

  return Class;
}

function createOptions(Parent, options) {
  var defaultOptions = {
    constructor : (typeof options === 'function') ? options : null,
    invokeParent : !(typeof options === 'function' || options && options.constructor),
    prototype : null,
    static : null,
    config : null,
    dependencies : null,
    bindToInstance : false
  };

  var configOptions = Object.assign(Object.create(Parent.$config || null), options && options.config);

  // Can't use Object.assign to merge config options in as we also want to copy prototype properties
  for (var key in configOptions){
    defaultOptions[key] = configOptions[key];
  }

  // Merge options with defaults
  options = Object.assign({}, defaultOptions, options);

  // Get dependencies
  // Either read them from the options, or extract them from the constructor
  if (!options.dependencies && typeof options.constructor === 'function'){
    options.dependencies = resolver.extractParameters(options.constructor);
  }else if(options.dependencies){
    options.dependencies = [].concat(options.dependencies);
  }
  if (options.dependencies && !options.dependencies.length){
    options.dependencies = null;
  }

  // MERGE OPTIONS HOOK
  if (Parent.$trigger){
    Parent.$trigger('options', {
      options : options,
      merge : function () {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(options);
        Object.assign.apply(Object, args);
      }
    });
  }

  return options;
}

function createClass(Parent, options) {
  var Class = classBody(Parent, options);

  Class.prototype = classPrototype(Parent, Class, options);

  Object.assign(Class, Parent, options.static);

  return Class;
}

function classBody(Parent, options) {
  var Class;
  Class = function (namedParameters) {
    // Don't allow the class to be called with a different context
    if (!(this instanceof Class)){
      return new Class(namedParameters);
    }

    try{
      // Resolve dependencies
      var args = resolver.resolveDependencies(Class, {dependencies : options.dependencies}, namedParameters);

      // BEFORE INSTANTIATE HOOK
      // (check that the class is not a parent of the current instance before hooking)
      if (this.constructor === Class){
        Class.$trigger('beforeCreate', {
          Class : Class,
          options : options,
          instance : this,
          args : args
        });
      }

      // Invoke Parent
      if (options.invokeParent && options.invokeParent !== 'after'){
        Class.$invokeParent(this, args, namedParameters);
      }

      // Bind dependencies
      if (options.bindToInstance){
        bindToInstance(this, Class, args, namedParameters, options.bindToInstance);
      }

      // Invoke constructor
      if (typeof options.constructor === 'function'){
        options.constructor.apply(this, args);
      }

      // Invoke Parent
      if (options.invokeParent === 'after'){
        Class.$invokeParent(this, args, namedParameters);
      }

      // AFTER INSTANTIATE HOOK
      if (this.constructor === Class){
        Class.$trigger('created', {
          Class : Class,
          options : options,
          instance : this,
          args : args
        });
      }
    }catch(e){
      if (e && e.jpexInternalError){
        e.stack = (new Error(e.message)).stack;
      }

      // Use error handler factory if available
      var errorHandler = resolver.resolve(Class, '_$errorHandler_', namedParameters);
      if (errorHandler){
        errorHandler(e);
      }else{
        throw e;
      }
    }
  };

  return Class;
}

function classPrototype(Parent, Class, options) {
  var prototype = Object.create(Parent.prototype);

  // Add new prototype methods
  if (options.prototype){
    Object.assign(prototype, options.prototype);
  }

  // Set the constructor
  prototype.constructor = Class;

  return prototype;
}

function bindToInstance(instance, Class, args, namedParameters, option) {
  var bindTo = instance;
  // Attach dependencies to a property on the instance
  if (typeof option === 'string'){
    option.split('.').forEach(function (key) {
      bindTo[key] = bindTo[key] || {};
      bindTo = bindTo[key];
    });
  }
  // Get the dependency names
  var bindParameters = Class.$namedParameters(args, namedParameters);
  Object.assign(bindTo, bindParameters);
}

};

__jpex_modules__[1] = function(require, module, exports){
  module.exports = require(2)();

};

__jpex_modules__[0] = function(require, module, exports){
  // This is test.js
debugger;
var Jpex = require(1);

var Class = Jpex.extend();
var instance = new Class(function () {
  console.log('Created');
});

module.exports = instance;

};

  var __jpex_require__ = function(target){
    if (__jpex_require__.cache[target]){
      return __jpex_require__.cache[target];
    }
    var module = { exports : {} };
    var fn = __jpex_modules__[target];
    if (!fn){
      throw new Error('Could not find module ' + target);
    }
    fn(__jpex_require__, module, module.exports);
    __jpex_require__.cache[target] = module.exports;

    return module.exports;
  };
  __jpex_require__.cache = [];

  if (typeof module !== 'undefined'){
    module.exports = __jpex_require__(0);
  }else if (typeof window !== 'undefined'){
    window['test'] = __jpex_require__(0);
  }
}());

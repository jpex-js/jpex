var hasOwn = require('../hasOwn');
var constants = require('../constants');
var resolver = require('../resolver');
var privates = require('./privates');
var factories = require('../factories');
var plugins = require('../plugins');

module.exports = function () {
  // Start with a basic function constructor
  var Base = function(){};
  Base.extend = extend;
  Base.use = plugins.use;

  // Extend the vanilla constructor to apply all the jpex-ness
  var Jpex = Base.extend();

  // Add the only default factory, $resolve
  require('./resolve')(Jpex);

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
    invokeParent : !(typeof options === 'function' || options && hasOwn(options, 'constructor') && options.constructor),
    methods : null,
    properties : null,
    static : null,
    config : null,
    dependencies : null,
    bindToInstance : false,
    defaultLifecycle : constants.INSTANCE
  };

  var configOptions = Object.assign(Object.create(Parent.$$config || null), options && options.config);

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

  // Set properties
  if (options.properties){
    options.properties = [].concat(options.properties);
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
        Class.$$invokeParent(this, args, namedParameters);
      }

      // Bind dependencies
      if (options.bindToInstance){
        bindToInstance(this, Class, args, namedParameters, options.bindToInstance);
      }

      // Properties
      if (options.properties){
        var properties = createProperties(options.properties);
        Object.defineProperties(this, properties);
      }

      // Invoke constructor
      if (typeof options.constructor === 'function'){
        options.constructor.apply(this, args);
      }

      // Invoke Parent
      if (options.invokeParent === 'after'){
        Class.$$invokeParent(this, args, namedParameters);
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
  if (options.methods){
    Object.assign(prototype, options.methods);
  }

  // Set the constructor
  prototype.constructor = Class;

  return prototype;
}

function createProperties(options) {
  var properties = {};

  options.forEach(function (option) {
    if (typeof option === 'string'){
      properties[option] = {
        configurable : true,
        enumerable : true,
        writable : true,
        value : undefined
      };
    }else{
      Object.keys(option).forEach(function (key) {
        var def = option[key];
        var property = {};

        switch (typeof def){
        case 'object':
          break;
        case 'function':
          def = { watch : def };
          break;
        default:
          def = { value : def };
          break;
        }

        var hasValue = hasOwn(def, 'value'),
          hasGet = hasOwn(def, 'get') && typeof def.get === 'function',
          hasSet = hasOwn(def, 'set') && typeof def.set === 'function',
          hasWatch = hasOwn(def, 'watch') && typeof def.watch === 'function',
          hasDefault = hasOwn(def, 'default') && typeof def.default === 'function';

        if (hasValue || hasDefault || hasGet || hasSet || hasWatch){
          var value = hasValue ? def.value : (hasDefault ? def.default() : undefined);

          property.get = function () {
            return hasGet ? def.get.call(this, value) : value;
          };
          if (!hasOwn(def, 'writable') || def.writable){
            property.set = function (v) {
              var newValue = hasSet ? def.set.call(this, v, value) : v;
              if (hasWatch && newValue !== value){
                def.watch.call(this, newValue, value);
              }
              value = newValue;
            };
          }
          property.configurable = hasOwn(def, 'configurable') ? def.configurable : true;
          property.enumerable = hasOwn(def, 'enumerable') ? def.enumerable : true;
        }else{
          property.configurable = true;
          property.enumerable = true;
          property.writable = true;
          property.value = def;
        }

        properties[key] = property;
      });
    }
  });

  return properties;
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
  var bindParameters = Class.$$namedParameters(args, namedParameters);
  Object.assign(bindTo, bindParameters);
}

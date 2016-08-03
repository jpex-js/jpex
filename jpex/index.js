'use strict';

var internal = require('./internal'),
    factories = require('./factories'),
    statics = require('./statics'),
    defaults = require('./defaults');

//Base class that all classes should inherit from
var Base = function(){};
Base.Copy = statics.Copy;
Base.Typeof = statics.Typeof;
Base.extend = function(params){
  var parentClass = this,
  opt = {
    constructor : (typeof params === 'function') ? params : null,
    invokeParent : !(typeof params === 'function' || (params && params.constructor)),
    prototype : null,
    static : null,
    dependencies : [],
    bindToInstance : false
  };
  
  //Merge params with defaults
  if (Base.Typeof(params) === 'object'){
    Object.keys(params).forEach(function(key){
      if ( opt[key] !== undefined ){
        opt[key] = params[key];
      }
    });
  }
  
  if (params && !params.dependencies && typeof opt.constructor === 'function'){
    opt.dependencies = internal.extractParameters(opt.constructor);
  }else{
    opt.dependencies = [].concat(opt.dependencies);
  }
  
  ////============================================================================
  //Create a new class
  var newClass;
  newClass = function(namedParameters){
    var self = this;
    
    //Get dependencies
    var args = internal.resolveDependencies(newClass, opt, namedParameters);
    
    //Invoke Parent before
    if (opt.invokeParent && opt.invokeParent !== 'after'){
      newClass.InvokeParent(self, args, namedParameters);
    }
    
    if (opt.bindToInstance){
      var bindParameters = newClass.NamedParameters(args, namedParameters);
      Object.keys(bindParameters).forEach(function(key){
        self[key] = bindParameters[key];
      });
    }
    
    //Run constructor
    if (typeof(opt.constructor) === 'function'){
      opt.constructor.apply(self, args);
    }
    
    //Invoke Parent after
    if (opt.invokeParent === 'after'){
      newClass.InvokeParent(self, args, namedParameters);
    }
  };
  ////============================================================================
  
  //Copy prototype from parent class
  newClass.prototype = Object.create(parentClass.prototype);
  
  if (opt.prototype){
    //Add new prototype methods (will override inherited methods)
    Object.keys(opt.prototype).forEach(function(key){
      newClass.prototype[key] = opt.prototype[key];
    });
  }
  
  //Set constructor
  newClass.prototype.constructor = newClass;
  
  //Apply static methods from this class
  if (opt.static){
    Object.keys(opt.static).forEach(function(key){
      newClass[key] = opt.static[key];
    });
  }
  
  //Copy static methods from parent class
  Object.keys(parentClass).forEach(function(key){
    if (newClass[key] === undefined){
      newClass[key] = parentClass[key];
    }
  });
  
  newClass.NamedParameters = internal.namedParameters.bind(newClass, opt.dependencies);
  
  newClass.InvokeParent = internal.invokeParent.bind(newClass, parentClass, opt.dependencies);
  
  //Dependency Injection
  newClass._factories = {};
  newClass._folders = [];
  newClass._getDependency = internal.getDependency.bind(newClass, parentClass);
  newClass._getFileFromFolder = internal.getFileFromFolder.bind(newClass, parentClass);
  newClass._getFromNodeModules = internal.getFromNodeModules.bind(newClass);
  newClass.Dependencies = opt.dependencies;
  newClass.Register = factories(newClass);
  
  return newClass;
};

module.exports = Base.extend();

// Register some default factories
defaults(module.exports);
'use strict';

var internal = require('./internal'),
    grequire = require('./grequire');

// Dependency Injection registration
module.exports = {
  factories : {
    Factory : Factory,
    Service : Service,
    Constant : Constant,
    Enum : Enum,
    File : File,
    Folder : Folder,
    NodeModule : NodeModule
  },
  apply : function(thisObj){
    var self = this;
    var register = function(){
      return register.Factory.apply(thisObj, arguments);
    };
    Object.keys(self.factories).forEach(function(f){
      var fn = self.factories[f];
      register[f] = fn.bind(thisObj);
    });
    
    thisObj.Register = register;
  }
};
// -----------------------------------------
// Return an object
function Constant(name, obj){
  this._factories[name] = {value : obj, constant : true};
  return this;
}
// -----------------------------------------
// Return a new instance
function Service(name, dependencies, fn, singleton){
  if (singleton === undefined && typeof fn === 'boolean'){
    singleton = fn;
    fn = undefined;
  }

  if (fn === undefined){
    fn = dependencies;
    dependencies = null;
  }
  
  if (typeof fn !== 'function'){
    return this;
  }
  
  if(fn.extend && fn.Register && fn.Register.Factory){
      return jaas.call(this, name, dependencies, fn, singleton);
  }
  
  if (dependencies){
    dependencies = [].concat(dependencies);
  }else{
    dependencies = internal.extractParameters(fn);
  }
  
  function instantiator(){
    var args = Array.from(arguments);
    args.unshift({});
    return new (Function.prototype.bind.apply(fn, args));
  }
  
  return this.Register.Factory(name, dependencies, instantiator, singleton);
}
// -----------------------------------------
function jaas(name, dependencies, Fn, singleton){
  // Assuming the parameters have been validated and sorted already
  dependencies = dependencies ? [].concat(dependencies) : [];
  dependencies.unshift('$namedParameters');
  
  function instantiator(){
    var args = Array.from(arguments);
    
    var params = {};
    
    // Get factory dependencies
    var i = 1;
    dependencies.forEach(function(key, index){
      if (index === 0){return;}
      
      if (typeof key === 'object'){
        Object.keys(key).forEach(function(key2){
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
      Object.keys(args[0]).forEach(function(key){
        var val = args[0][key];
        if (val !== undefined){
          params[key] = args[0][key];
        }
      });
    }
    
    // Instantiate the class
    return new Fn(params);
  }
  
  return this.Register.Factory(name, dependencies, instantiator, singleton);
}

// -----------------------------------------
// Return a factory function
function Factory(name, dependencies, fn, singleton){
  var self = this;
  
  if (singleton === undefined && typeof fn === 'boolean'){
    singleton = fn;
    fn = undefined;
  }
  
  if (fn === undefined){
    fn = dependencies;
    dependencies = null;
  }
  
  if (typeof fn !== 'function'){
    return this;
  }
  
  if (dependencies){
    dependencies = [].concat(dependencies);
  }else{
    dependencies = internal.extractParameters(fn);
  }
  if (!dependencies.length){
    dependencies = null;
  }
  
  if (singleton){
    var oldFn = fn;
    fn = function(){
      var instance = oldFn.apply(null, arguments);
      self.Register.Constant(name, instance);
      return instance;
    };
  }
  
  this._factories[name] = {
    fn : fn,
    dependencies : dependencies
  };
  return this;
}
// -----------------------------------------
function File(name, path){
  return this.Register.Factory(name, null, () => grequire(path), true);
}
// -----------------------------------------
function Folder(path, opt){
  if (typeof opt === 'object' && this.Register.SmartFolder){
    return this.Register.SmartFolder(path, opt);
  }
  
  if (this._folders.indexOf(path) === -1 ){
    this._folders.push(path);
  }
  
  return this;
}

// -----------------------------------------
function NodeModule(name){
  return this.Register.Factory(name, null, () => require(name), true);
}
// -----------------------------------------
function Enum(name, value){
  var self = this;

  var obj = {};
  var lastIndex = -1;
  
  [].concat(value).forEach(function(v){
    switch(self.Typeof(v)){
      case 'object':
        Object.keys(v).forEach(function(v2){
          var id = v[v2];
          obj[v2] = id;
          if (typeof id === 'number' && id > lastIndex){
            lastIndex = id;
          }
        });
        break;
      case 'string':
      case 'number':
        obj[v] = ++lastIndex;
        break;
    }
  });
  
  Object.freeze(obj);
  
  return this.Register.Constant(name, obj);
}
'use strict';

var internal = require('./internal'),
    grequire = require('./grequire');

// Dependency Injection registration
module.exports = function(thisObj){
  var register;
  register = function(){
    return register.Factory.apply(thisObj, arguments);
  };
  register.Factory = Factory.bind(thisObj);
  
  register.Constant = Constant.bind(thisObj);
  register.Service = Service.bind(thisObj);
  register.Enum = Enum.bind(thisObj);
  
  register.File = File.bind(thisObj);
  register.Folder = Folder.bind(thisObj);
  register.NodeModule = NodeModule.bind(thisObj);
  
  return register;
};
// -----------------------------------------
// Return an object
function Constant(name, obj){
  return this.Register.Factory(name, null, () => obj, true);
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
    var instance;
    var oldFn = fn;
    fn = function(){
      if (!instance){
        instance = oldFn.apply(null, arguments);
      }
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
  return this.Register.Factory(name, null, function(){
    return grequire(path);
  }, true);
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
  return this.Register.Factory(name, null, function(){
    return require(name);
  }, true);
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
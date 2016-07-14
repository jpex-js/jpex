var internal = require('./internal'),
    grequire = require('./grequire');

// Dependency Injection registration
module.exports = function(thisObj){
  return {
    Constant : Constant.bind(thisObj),
    Service : Service.bind(thisObj),
    Factory : Factory.bind(thisObj),
    Enum : Enum.bind(thisObj),
    
    File : File.bind(thisObj),
    Folder : Folder.bind(thisObj),
    NodeModule : NodeModule.bind(thisObj)
  };
};

// Return an object
function Constant(name, obj){
  return this.Register.Factory(name, null, () => obj);
}

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

function File(name, path){
  var file;
  return this.Register.Factory(name, null, () => file || (file = grequire(path)));
}

function Folder(path){
  if (this._folders.indexOf(path) === -1 ){
    this._folders.push(path);
  }
  
  return this;
}

function NodeModule(name){
  var file;
  return this.Register.Factory(name, null, () => file || (file = require(name)));
}

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
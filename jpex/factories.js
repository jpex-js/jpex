var internal = require('./internal'),
    grequire = require('./grequire'),
    master;

// Dependency Injection registration
module.exports = function(thisObj){
  var register = function(){
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
  return this.Register.Factory(name, null, () => obj);
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
function jaas(name, dependencies, fn, singleton){
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
    if (args[0] && args[0]){
      Object.keys(args[0]).forEach(function(key){
        var val = args[0][key];
        if (val !== undefined){
          params[key] = args[0][key];
        }
      });
    }
    
    // Instantiate the class
    return new fn(params);
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
  var file;
  return this.Register.Factory(name, null, () => file || (file = grequire(path)));
}
// -----------------------------------------
function Folder(path, opt){
  if (typeof opt === 'object'){
    return smartfolder.call(this, path, opt);
  }
  
  if (this._folders.indexOf(path) === -1 ){
    this._folders.push(path);
  }
  
  return this;
}
// -----------------------------------------
function smartfolder(path, opt){
  var self = this;
  var glob = require('glob');
  var Path = require('path');
  
  opt = {
    type : opt.type || 'auto',
    singleton : opt.singleton,
    prefix : opt.prefix,
    suffix : opt.suffix,
    prefixFolder : opt.prefixFolder !== undefined ? opt.prefixFolder : true,
    pattern : opt.pattern || '**/*.js',
    transform : opt.transform,
    register : opt.register
  };
  if (!opt.transform){
    opt.transform = function(file, folders){
      // Build up the name of the dependency
      var result = [];
      
      if (opt.prefix){
        result.push(toPascal(opt.prefix));
      }
      if (opt.prefixFolder){
        result.push(toPascal(folders));
      }
      if (file !== 'index'){
        result.push(toPascal(file));
      }
      if (opt.suffix){
        result.push(toPascal(opt.suffix));
      }
      
      result = result.join('');
      return result.length ? 
        result[0].toLowerCase() + result.substring(1) : '';
    };
  }
  if (!opt.register){
    opt.register = function(name, obj){
      // Register the dependency
      switch (opt.type.toLowerCase()){
        case 'factory':
          if (typeof obj !== 'function'){
            throw new Error('Factory type expected but got ' + typeof obj);
          }
          self.Register.Factory(name, null, obj, opt.singleton);
          break;
          
        case 'service':
          if (typeof obj !== 'function'){
            throw new Error('Service type expected but got ' + typeof obj);
          }
          self.Register.Service(name, null, obj, opt.singleton);
          break;
          
        case 'constant':
          self.Register.Constant(name, obj);
          break;
          
        case 'enum':
          self.Register.Enum(name, obj);
          break;
          
        case 'auto':
          if (typeof obj === 'function'){
            self.Register.Factory(name, null, obj, opt.singleton);
          }else{
            self.Register.Constant(name, obj);
          }
          break;
      }
    };
  }
  
  // Get the absolute path of the search folder
  var root = Path.resolve(path);
  // Retrieve all files that match the pattern
  glob.sync(opt.pattern, {cwd : root})
  .map(function(file){
    // Get the name of the dependency
    var info = Path.parse(file);
    var folders = info.dir ? info.dir.split('/') : [];
    var ext = info.ext;
    var base = info.name;
    var name = opt.transform.call(self, base, folders, ext);

    return {
      path : [path, file].join('/'),
      file : base,
      name : name
    };
  })
  .filter(function(file){
    // Remove blank/uncalculated dependencies
    return !!file.name;
  })
  .forEach(function(file){
    // Grap the content of the file and register it
    var content = grequire(file.path);
    opt.register.call(self, file.name, content);
  });
  
  return self;
}
function toPascal(arr){
  return []
    .concat(arr)
    .map(function(folder){
      return folder[0].toUpperCase() + folder.substring(1).toLowerCase();
    })
    .join('');
}

// -----------------------------------------
function NodeModule(name){
  var file;
  return this.Register.Factory(name, null, () => file || (file = require(name)));
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
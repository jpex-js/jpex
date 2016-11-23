var grequire = require('./grequire'),
    glob = require('glob'),
    Path = require('path');

function smartfolder(path, opt){
  var self = this;

  opt = {
    type : opt.type || 'auto',
    singleton : opt.singleton,
    prefix : opt.prefix,
    suffix : opt.suffix,
    prefixFolder : opt.prefixFolder !== undefined ? opt.prefixFolder : true,
    pattern : opt.pattern || '**/*.js',
    transform : opt.transform,
    register : opt.register,
    interface : opt.interface
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
      var f;
      switch (opt.type.toLowerCase()){
        case 'factory':
          if (typeof obj !== 'function'){
            throw new Error('Factory type expected but got ' + typeof obj);
          }
          f = self.Register.Factory(name, obj.dependencies, obj, opt.singleton);
          break;

        case 'service':
          if (typeof obj !== 'function'){
            throw new Error('Service type expected but got ' + typeof obj);
          }
          f = self.Register.Service(name, obj.dependencies, obj, opt.singleton);
          break;

        case 'interface':
          if (typeof obj !== 'function'){
            throw new Error('Interface type expected but got ' + typeof obj);
          }
          f = self.Register.Interface(name, obj);
          break;

        case 'constant':
          f = self.Register.Constant(name, obj);
          break;

        case 'enum':
          self.Register.Enum(name, obj);
          break;

        case 'auto':
          if (typeof obj === 'function'){
            if (obj.extend && obj.Register && obj.Register.Factory){
              f = self.Register.Service(name, obj.dependencies, obj, opt.singleton);
            }else{
              f = self.Register.Factory(name, obj.dependencies, obj, opt.singleton);
            }
          }else{
            f = self.Register.Constant(name, obj);
          }
          break;
      }

      if (f){
        if (opt.interface){
          f.interface(opt.interface);
        }
        if (obj){
          if (obj.interface){
            f.interface(obj.interface);
          }
          if (obj.lifecycle && f.lifecycle[obj.lifecycle]){
            f.lifecycle[obj.lifecycle]();
          }
        }
      }
    };
  }

  // Get the absolute path of the search folder
  var root = Path.isAbsolute(path) ? path : Path.resolve(path);

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
      path : ([path, file]).join('/'),
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

module.exports = function(){
  var jpex = require('jpex');
  var factories = require('jpex/lib/factories');
  factories.factories.SmartFolder = smartfolder;
  factories.apply(jpex);
};

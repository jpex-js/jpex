// These are private methods attached to each Class extended from jpex
// As it's used so often, the first parameter of every method should be ParentClass

module.exports = {
  getters : {
    // Check if a factory has been registered on this class, if not,
    // check the parent class and so on
    _getDependency : function(parentClass, name){
      if (this._factories[name]){
        return this._factories[name];
      }
      if (parentClass._getDependency){
        return parentClass._getDependency(name);
      }
      return null;
    },
    // Builds a list of decorators registered for a factory
    // Looks at parent classes and then this class
    _getDecorators : function(parentClass, name){
      var d = [];
      if (parentClass._getDecorators){
        d = parentClass._getDecorators(name);
      }
      if (this._decorators[name]){
        d = d.concat(this._decorators[name]);
      }
      return d;
    },
    // Attemps to find a dependency by looking in the registered folders
    _getFileFromFolder : function(parentClass, name){
      var grequire = require('../../grequire');
      var x, result;
      for (x = 0; x < this._folders.length; x++){
        try{
          result = grequire(this._folders[x] + '/' + name);
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
    },
    // Attempt to require a dependency as a node module
    _getFromNodeModules : function(parentClass, name){
      try{
        var result = require(name);
        this.Register.Constant(name, result);
        return this._factories[name];
      }
      catch(e){
      }
    }
  },
  manual : {
    // Builds a list of key value pairs for the class's named parameters
    NamedParameters : function(keys, values, args){
      if (!args || typeof args !== 'object'){
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
    },
    InvokeParent : function(parentClass, instance, values, args){
      if (values && !Array.isArray(values)){
        values = Array.from(values);
      }
      args = this.NamedParameters(values, args);
      parentClass.call(instance, args);
    }
  },
  
  apply : function(Class, Parent, dependencies){
    Object.keys(this.getters).forEach(n => {
      Object.defineProperty(Class, n, {
        value : this.getters[n].bind(Class, Parent)
      });
    });
    
    Object.defineProperties(Class, {
      NamedParameters : {
        value : this.manual.NamedParameters.bind(Class, dependencies)
      },
      InvokeParent : {
        value : this.manual.InvokeParent.bind(Class, Parent)
      },
      _parent : {
        get : () => Parent
      },
      _factories : {
        writable : true,
        value : {}
      },
      _folders : {
        writable : true,
        value : []
      },
      _decorators : {
        writable : true,
        value : []
      }
    });
  }
};
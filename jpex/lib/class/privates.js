// These are private methods attached to each Class extended from jpex
// As it's used so often, the first parameter of every method should be ParentClass

module.exports = {
  getters : {
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
        var result = require.main.require(name);
        this.Register.Constant(name, result);
        return this._factories[name];
      }
      catch(e){
        if (!(e && e.message && e.message.substr(0, 6) === 'Cannot')){
          throw e;
        }
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

  properties : {},

  apply : function(Class, Parent, dependencies){
    Object.keys(this.getters).forEach(n => {
      Object.defineProperty(Class, n, {
        value : this.getters[n].bind(Class, Parent)
      });
    });

    Object.keys(this.properties).forEach(n => {
      Class[n] = this.properties[n].call(Class);
    });

    Object.defineProperties(Class, {
      NamedParameters : {
        value : this.manual.NamedParameters.bind(Class, dependencies)
      },
      InvokeParent : {
        value : this.manual.InvokeParent.bind(Class, Parent)
      },
      _parent : {
        value : Parent
      },
      _factories : {
        writable : true,
        value : Object.create(Parent._factories || null)
      },
      _resolved : {
        writeable : true,
        value : {}
      },
      _interfaces : {
        writeable : true,
        value : Object.create(Parent._interfaces || null)
      },
      _folders : {
        writable : true,
        value : []
      }
    });

    Class._parent = Parent;
    Class._factories = Object.create(Parent._factories || null);
    Class._interfaces = Object.create(Parent._interfaces || null);
    Class._resolved = {};
    Class._folders = [];
  }
};

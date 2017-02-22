var isNode = require('../isNode');
var triggerHook = require('../plugins').trigger;
var resolve = require('../resolver').resolve;

function getFromNodeModules(name) {
    if (!isNode){
        return;
    }
  // In order to stop webpack and browserify from requiring every possible file, we have to wrap the require statement in an eval
    try{
        var result = eval('require.main.require(name)');
        this.register.constant(name, result);
        return this.$$factories[name];
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
    args = this.$$namedParameters(values, args);
    var Parent = this.$$parent;
    Parent.call(instance, args);
}
function clearCache(names) {
  names = names ? [].concat(names) : [];

  for (var key in this.$$factories){
    if (!names.length || names.indexOf(key) > -1){
      this.$$factories[key].resolved = false;
    }
  }
}

module.exports = function (Parent, Class, options) {
    Object.defineProperties(Class, {
      $trigger : {
          value : triggerHook
      },
      $resolve : {
        value : resolve.bind(null, Class)
      },
      $clearCache : {
        value : clearCache
      },

      $$getFromNodeModules : {
          value : getFromNodeModules
      },
      $$namedParameters : {
          value : namedParameters.bind(null, options.dependencies)
      },
      $$invokeParent : {
          value : invokeParent
      },
      $$parent : {
          get : function () {
              return Parent;
          }
      },
      $$factories : {
          writable : true,
          value : Object.create(Parent.$$factories || null)
      },
      $$resolved : {
          writable : true,
          value : Object.create(Parent.$$interfaces || null)
      },
      $$config : {
          writable : true,
          value : Object.assign(Object.create(Parent.$$config || null), options.config)
      },
      $$hooks : {
          writable : true,
          value : Object.create(Parent.$$hooks || null)
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

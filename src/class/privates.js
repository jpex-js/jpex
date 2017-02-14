var isNode = require('../isNode');

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

module.exports = function (Parent, Class, options) {
  Object.defineProperties(Class, {
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
    }
  });

  // PRIVATES HOOK
};

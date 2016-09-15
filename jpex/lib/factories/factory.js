var extractParameters = require('../resolver').extractParameters;
var wrapper = require('./wrapper');

// Return a factory function
module.exports = function(name, dependencies, fn, singleton){
  var self = this;
  
  if (typeof dependencies === 'function'){
    singleton = fn;
    fn = dependencies;
    dependencies = null;
  }
  
  if (typeof fn !== 'function'){
    return this;
  }
  
  if (dependencies){
    dependencies = [].concat(dependencies);
  }else{
    dependencies = extractParameters(fn);
  }
  if (!dependencies.length){
    dependencies = null;
  }
  
  if (singleton){
    var oldFn = fn;
    fn = function(){
      var instance = oldFn.apply(null, arguments);
      self.Register.Constant(name, instance);
      self._factories[name].interface = factoryObj.interface;
      if (factoryObj.interfaceResolved){
        self._factories[name].interfaceResolved = true;
      }
      return instance;
    };
  }
  
  var factoryObj = {
    fn : fn,
    dependencies : dependencies,
    lifecycle : !!singleton
  };
  
  this._factories[name] = factoryObj;
  return wrapper(factoryObj);
};
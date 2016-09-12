var extractParameters = require('../resolver').extractParameters;

// Return a factory function
module.exports = function(name, dependencies, fn, interface, singleton){
  var self = this;
  
  if (typeof dependencies === 'function'){
    singleton = interface;
    interface = fn;
    fn = dependencies;
    dependencies = null;
  }
  if (typeof interface === 'boolean'){
    singleton = interface;
    interface = null;
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
  
  if (interface){
    interface = [].concat(interface);
  }else{
    interface = null;
  }
  
  if (singleton){
    var oldFn = fn;
    fn = function(){
      var instance = oldFn.apply(null, arguments);
      self.Register.Constant(name, instance, interface);
      return instance;
    };
  }
  
  this._factories[name] = {
    fn : fn,
    dependencies : dependencies,
    interface : interface
  };
  return this;
};
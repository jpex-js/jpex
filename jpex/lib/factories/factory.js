var extractParameters = require('../resolver').extractParameters;

// Return a factory function
module.exports = function(name, dependencies, fn, singleton){
  var self = this;
  
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
      return instance;
    };
  }
  
  this._factories[name] = {
    fn : fn,
    dependencies : dependencies
  };
  return this;
};
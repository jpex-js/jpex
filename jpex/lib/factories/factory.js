var extractParameters = require('../resolver').extractParameters;
var wrapper = require('./wrapper');

// Return a factory function
module.exports = function(name, dependencies, fn, singleton){  
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
  
  var factoryObj = {
    fn : fn,
    dependencies : dependencies
  };
//  var result = wrapper(factoryObj);
  this._factories[name] = factoryObj;
  
  return wrapper(factoryObj).lifecycle[singleton ? 'application' : 'instance']();
};
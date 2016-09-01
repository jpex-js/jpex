var extractParameters = require('../resolver').extractParameters;

// Decorate a function
module.exports = function(name, dependencies, fn){
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
  
  if (!this._decorators[name]){
    this._decorators[name] = [];
  }
  this._decorators[name].push({
    fn : fn,
    dependencies : dependencies
  });
  return this;
};
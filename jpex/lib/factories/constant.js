var wrapper = require('./wrapper');

// Return an object
module.exports = function(name, obj){  
  this._factories[name] = {
    value : obj, 
    constant : true
  };
  return wrapper(this._factories[name]).lifecycle.application();
};
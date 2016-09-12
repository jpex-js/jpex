// Return an object
module.exports = function(name, obj, interface){
  if (interface){
    interface = [].concat(interface);
  }
  
  this._factories[name] = {value : obj, interface : interface, constant : true};
  return this;
};
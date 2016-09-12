var extractParameters = require('../resolver').extractParameters;

// Return a new instance
module.exports = function(name, dependencies, fn, interface, singleton){
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
  
  if(fn.extend && fn.Register && fn.Register.Factory){
      return jaas.call(this, name, dependencies, fn, interface, singleton);
  }
  
  if (dependencies){
    dependencies = [].concat(dependencies);
  }else{
    dependencies = extractParameters(fn);
  }
  
  function instantiator(){
    var args = Array.from(arguments);
    args.unshift({});
    return new (Function.prototype.bind.apply(fn, args));
  }
  
  return this.Register.Factory(name, dependencies, instantiator, interface, singleton);
};

// -----------------------------------------

// Jpex Class As A Service
function jaas(name, dependencies, Fn, interface, singleton){
  // Assuming the parameters have been validated and sorted already
  dependencies = dependencies ? [].concat(dependencies) : [];
  dependencies.unshift('$namedParameters');
  
  function instantiator(){
    var args = Array.from(arguments);
    
    var params = {};
    
    // Get factory dependencies
    var i = 1;
    dependencies.forEach(function(key, index){
      if (index === 0){return;}
      
      if (typeof key === 'object'){
        Object.keys(key).forEach(function(key2){
          var val = args[i++];
          if (val !== undefined){
            params[key2] = val;
          }
        });
      }else{
        var val = args[i++];
        if (val !== undefined){
          params[key] = val;
        }
      }
    });
    
    // Get named dependencies
    if (args[0] && typeof args[0] === 'object'){
      Object.keys(args[0]).forEach(function(key){
        var val = args[0][key];
        if (val !== undefined){
          params[key] = args[0][key];
        }
      });
    }
    
    // Instantiate the class
    return new Fn(params);
  }
  
  // Get interface
  interface = [].concat(interface || []);
  if (Fn.Interface){
    interface = interface.concat(Fn.Interface);
  }
  
  return this.Register.Factory(name, dependencies, instantiator, interface, singleton);
}
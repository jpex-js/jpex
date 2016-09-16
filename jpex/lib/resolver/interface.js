exports.getInterface = function(Class, name){
  return Class._getInterface(name);
};

exports.factoryImplements = function(Class, fname, iname){
    var factory = Class._getDependency(fname);
    
    // Check that factory has any interfaces
    if (!(factory && factory.interface && factory.interface.length)){
      return false;
    }
    
    // Expand to include all interfaces
    if (!factory.interfaceResolved){
      factory.interface = listInterfaces(Class, factory.interface);
      factory.interfaceResolved = true;
    }
    
    return factory.interface.indexOf(iname) > -1;
};

// Check if name is an interface and then find and return the name of a matching factory (if there is one)
exports.findFactory = function(Class, iname){  
  var filterFn = function(fname){
    return exports.factoryImplements(Class, fname, iname);
  };
  
  // Find a factory that matches the interface
  while (Class){
    
    if (!Class._factories){
      break;
    }
    
    var factory = Object.keys(Class._factories).find(filterFn);
    
    if (factory !== undefined){
      return factory;
    }else{
      Class = Class._parent;
    }
  }
  
  return iname; // no corresponding factory but it is an interface
};

exports.validateInterface = function(Class, interface, value){
  if (interface === undefined){
    return;
  }
  var stack = crossReferenceInterface(Class, interface.pattern, value);
  
  if (stack){
    var message = ['Factory', interface.name, 'does not match interface pattern.'].concat(stack).join(' ');
    throw new Error(message);
  }
  
  if (interface.interface){
    interface.interface.forEach(i => exports.validateInterface(Class, exports.getInterface(Class, i), value));
  }
};

function crossReferenceInterface(Class, interface, obj){
  var stack = [];
  var itype = Class.Typeof(interface);
  var otype = Class.Typeof(obj);
  
  if (itype === 'array'){
    switch(interface.iType){
      case 'any':
        if (otype === 'undefined'){
          stack.push('Must be defined');
          return stack;
        }
        return;
        
      case 'either':
        for (var z = 0; z < interface.length; z++){
          var t = crossReferenceInterface(Class, interface[z], obj);
          if (t){
            stack.push(Class.Typeof(interface[z]));
          }else{
            return;
          }
        }
        return [stack.join('/')];
    }
  }
  
  if (itype !== otype){
    // Type mismatch
    stack.push('Not a', itype);
    return stack;
  }
  
  switch(itype){
    case 'function':
    case 'object':
      Object.keys(interface).forEach(function(key){
        var result = crossReferenceInterface(Class, interface[key], obj[key]);
        if (result){
          stack = stack.concat([key, ':']).concat(result);
        }
      });
      break;
      
    case 'array':
      if (!interface.length || !obj.length){
        //Empty
        return;
      }
      interface = interface[0];
      for (var y = 0; y < obj.length; y++){
        var result = crossReferenceInterface(Class, interface, obj[y]);
        if (result){
          stack = stack.concat(result);
        }
      }
      break;
  }
  
  if (stack.length){
    return stack;
  }
}

function listInterfaces(Class, name){
  var list = [].concat(name);
  
  list.forEach(function(n){
    var interface = Class._getInterface(n);
    if (interface && interface.interface && interface.interface.length){
      var arr = interface.interface.map(i => listInterfaces(Class, i));
      if (arr && arr.length){
        list = list.concat.apply(list, arr);
      }
    }
  });
  
  return list;
}
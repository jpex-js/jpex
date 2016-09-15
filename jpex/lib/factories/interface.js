var wrapper = require('./wrapper');
var util = {
  string : '',
  number : 0,
  null : null,
  boolean : true,
  object : {},
  array : [],
  function : () => {},
  
  arrayOf : function(){
    return [util.either.apply(util, arguments)];
  },
  functionWith : function(obj){
    var fn = function(){};
    Object.keys(obj).forEach(function(k){
      fn[k] = obj[k];
    });
    return fn;
  },
  either : function(){
    var arr = Array.from(arguments);
    if (arr.length === 1){
      return arr[0];
    }
    arr.iType = 'either';
    return arr;
  },
  any : function(){
    var arr = [];
    arr.iType = 'any';
    return arr;
  }
};

module.exports = function(name, fn, interface){
  if (interface){
    interface = [].concat(interface);
  }
  this._interfaces[name] = {
    name : name,
    pattern : fn(util),
    interface : interface
  };
  return wrapper(this._interfaces[name]);
};
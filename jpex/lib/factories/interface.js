var util = {
  string : '',
  number : 0,
  null : null,
  boolean : true,
  object : {},
  array : [],
  function : () => {},
  
  either : function(){
    var arr = Array.from(arguments);
    arr.iCanBeEither = true;
  }
};

module.exports = function(name, fn){
  this._interfaces[name] = fn(util);
  return this;
};
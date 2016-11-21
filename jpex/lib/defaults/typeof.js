module.exports = function (NewClass) {
  NewClass.Register.Interface('$itypeof', i => i.function);

  NewClass.Register.Factory('$typeof', null, function () {
    var standardTypes = ['number', 'boolean', 'string', 'array', 'function', 'date', 'regexp', 'null', 'undefined'];
    return function(obj, returnClassName){
      var t = Object.prototype.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
      return (!returnClassName && standardTypes.indexOf(t) < 0) ? 'object' : t;
    };
  }).lifecycle.application().interface('$itypeof');
};

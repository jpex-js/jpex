module.exports = function (NewClass) {
  NewClass.Register.Interface('$icopy', i => i.functionWith({
    shallow : i.function,
    deep : i.function,
    extend : i.function
  }));

  NewClass.Register.Factory('$copy', ['$typeof'], function ($typeof) {
    var copier = function (from, to, recur) {
      switch ($typeof(from)){
        case 'string':
        case 'number':
        case 'boolean':
        case 'function':
        case 'null':
        case 'undefined':
          return from;

        case 'date':
          return new Date(from);

        case 'regexp':
          var flags = [];
          if (from.global){flags.push('g');}
          if (from.ignoreCase){flags.push('i');}
          return new RegExp(from.source, flags.join(''));

        case 'array':
          return from.map(function (item) {
            return recur ? copier(item) : item;
          });

        case 'object':
          to = to || {};
          Object.keys(from).forEach(function (key) {
            to[key] = recur ? copier(from[key], to[key], recur) : from[key];
          });
          return to;

        default:
          throw new Error('Unexpected type: ' + $typeof(from));
      }
    };
    var $copy = function (obj) {
      return $copy.shallow(obj);
    };
    $copy.shallow = function (obj) {
      return copier(obj);
    };
    $copy.deep = function (obj) {
      return copier(obj, null, true);
    };
    $copy.extend = function () {
      var args = Array.from(arguments);
      var target = args.shift();
      args.forEach(function (arg) {
        copier(arg, target, true);
      });
      return target;
    };
    return $copy;
  }).lifecycle.application().interface('$icopy');
};

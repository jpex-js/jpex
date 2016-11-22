module.exports = function (Class) {
  Class.Register.Factory('$resolve', null, function () {
    var resolver = require('../resolver');
    var TheClass = this;
    return function (name, parameters) {
      return resolver.resolve(TheClass, name, parameters);
    };
  }).lifecycle.class();
};

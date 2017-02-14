var resolver = require('../resolver');

module.exports = function (Jpex) {
  Jpex.register.factory('$resolve', [], function () {
    var TheClass = this;
    return function (name, namedParameters) {
      return resolver.resolve(TheClass, name, namedParameters);
    };
  }).lifecycle.class();
};

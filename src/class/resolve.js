var resolver = require('../resolver');

module.exports = function (Jpex) {
  Jpex.register.factory('$resolve', [], function () {
    var TheClass = this;
    return function (name, namedParameters) {
      return Array.isArray(name) ?
            resolver.resolveDependencies(TheClass, {dependencies : name}, namedParameters) :
            resolver.resolve(TheClass, name, namedParameters);
    };
  }).lifecycle.class();
};

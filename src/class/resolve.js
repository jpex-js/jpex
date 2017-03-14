var resolver = require('../resolver');

module.exports = function (Jpex) {
  Jpex.register.factory('$resolve', ['$namedParameters'], function ($namedParameters) {
    var TheClass = this;
    return function (name, namedParameters) {
      namedParameters = Object.assign({}, $namedParameters, namedParameters);

      return Array.isArray(name) ?
            resolver.resolveDependencies(TheClass, {dependencies : name}, namedParameters) :
            resolver.resolve(TheClass, name, namedParameters);
    };
  });
};

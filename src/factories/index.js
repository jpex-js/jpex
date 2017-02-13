var constant = require('./constant');
var factory = require('./factory');
var service = require('./service');
var nodeModule = require('./nodemodule');

module.exports = function (Class, options) {
  var register = function () {
    return register.factory.apply(Class, arguments);
  };
  register.constant = constant.bind(Class);
  register.factory = factory.bind(Class);
  register.service = service.bind(Class);
  register.nodeModule = nodeModule.bind(Class);

  // FACTORY HOOKS

  Object.defineProperty(Class, 'register', {
    value : register
  });
};

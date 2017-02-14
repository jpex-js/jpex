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
  Class.$$trigger('factories', {
    Class : Class,
    options : options,
    register : function (name, fn) {
      register[name] = fn.bind(Class);
    }
  });

  Object.defineProperty(Class, 'register', {
    value : register
  });
};

var wrapper = require('./wrapper');

module.exports = function (name, obj) {
  var f = { value : obj, constant : true };
  this.$$factories[name] = f;
  return wrapper(f).lifecycle.application();
};

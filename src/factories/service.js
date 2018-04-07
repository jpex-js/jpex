var extractParameters = require('../resolver').extractParameters;
var instantiator = require('../instantiator');
var jaas = require('./jaas');

module.exports = function (name, dependencies, fn) {
  if (typeof dependencies === 'function'){
    fn = dependencies;
    dependencies = null;
  }

  if (typeof fn !== 'function'){
    throw new Error('Service ' + name + ' - fn must be a [Function]');
  }

  if (fn.extend && fn.register && fn.register.factory){
    return jaas.call(this, name, dependencies, fn);
  }

  if (dependencies){
    dependencies = [].concat(dependencies);
  }else{
    dependencies = extractParameters(fn);
  }

  function factory() {
    var args = Array.prototype.slice.call(arguments);
    var context = {};

    if (factory.bindToInstance) {
      dependencies.forEach(function (key, i) {
        context[key] = args[i];
      });
      fn.apply(context, args);
      return context;
    }

    args.unshift(context);
    return instantiator(fn, args);
  }

  return this.register.factory(name, dependencies, factory);
};

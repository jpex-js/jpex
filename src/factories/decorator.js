module.exports = function (name, fn) {
  var factory = this.$$factories[name];
  if (!factory){
    throw new Error('Decorator could not be applied as factory ' + name + ' has not been registered');
  }
  // If the factory does not exist on this class, we don't want to mutate the original definition
  // so copy the factory onto the current class...
  if (!Object.hasOwnProperty.call(this.$$factories, name)){
    factory = Object.assign({}, this.$$factories[name]);
    this.$$factories[name] = factory;
  }
  // If the factory has already been resolved, the decorator will never be called
  if (factory.resolved){
    factory.resolved = false;
  }
  if (this.$$resolved[name]){
    delete this.$$resolved[name];
  }

  factory.decorators = (factory.decorators || []).concat(fn);
};

import { hasOwn } from '../utils';
import { JpexInstance, AnyFunction } from '../types';

function decorator(jpex: JpexInstance, name: any, fn: AnyFunction) {
  let factory = jpex.$$factories[name];
  if (!factory) {
    throw new Error(`Decorator could not be applied as factory ${name} has not been registerd`);
  }

  // If the factory has been inherited, we want to create a new copy of it first
  if (!hasOwn(jpex.$$factories, name)) {
    factory = {
      ...factory,
    };
    jpex.$$factories[name] = factory;
  }
  // If the factory has already been resolved, the decorator will never be called
  if (factory.resolved) {
    factory.resolved = false;
  }
  if (jpex.$$resolved[name]) {
    delete jpex.$$resolved[name];
  }

  factory.decorators = (factory.decorators || []).concat(fn);
}

export default decorator;

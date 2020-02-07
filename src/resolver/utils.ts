import JpexError from '../Error';
import {
  AnyFunction,
  Factory,
  JpexInstance,
} from '../types';
import { Lifecycle } from '../constants';
import {
  isNode,
  unsafeRequire,
} from '../utils';

export const isValidFactory = (factory: Factory) => {
  if (!factory) {
    return false;
  }
  if (factory.fn && typeof factory.fn === 'function') {
    return true;
  }
  if (factory.resolved) {
    return true;
  }
  return false;
};

export const getFromNodeModules = (jpex: JpexInstance, target: string): Factory => {
  // in order to stop webpack environments from including every possible
  // import source in the bundle, we have to stick all node require stuff
  // inside an eval setup
  if (!isNode) {
    return;
  }

  try {
    const value = unsafeRequire(target);
    jpex.constant(target, value);
    return jpex.$$factories[target];
  } catch (e) {
    if (e && e.message && e.message.includes(`Cannot find module '${target}'`)) {
      // not found in node modules, just continue
      return;
    }

    throw e;
  }
};

export const getFactory = (jpex: JpexInstance, name: string, optional: boolean) => {
  let factory: Factory = jpex.$$resolved[name as string];
  if (isValidFactory(factory)) {
    return factory;
  }

  factory = jpex.$$factories[name as string];
  if (isValidFactory(factory)) {
    return factory;
  }

  factory = getFromNodeModules(jpex, name as string);
  if (isValidFactory(factory)) {
    return factory;
  }

  if (!optional) {
    throw new JpexError(`Unable to find required dependency [${name}]`);
  }
};

export const runDecorators = (jpex: JpexInstance, value: any, decorators: AnyFunction[]) => {
  if (!decorators || !decorators.length) {
    return value;
  }

  return decorators.reduce((value, decorator) => {
    return decorator.call(jpex, value);
  }, value);
};

export const cacheResult = (
  jpex: JpexInstance,
  name: string,
  factory: Factory,
  value: any,
  namedParameters: { [key: string]: any },
) => {
  switch (factory.lifecycle) {
  case Lifecycle.APPLICATION:
    factory.resolved = true;
    factory.value = value;
    break;
  case Lifecycle.CLASS:
    jpex.$$resolved[name as string] = {
      resolved: true,
      value,
    };
    break;
  case Lifecycle.NONE:
    break;
  case Lifecycle.INSTANCE:
  default:
    namedParameters[name as string] = value;
    break;
  }
};

export const checkOptional = (name: string) => {
  if (typeof name !== 'string') {
    return false;
  }
  if ((name[0] === '_' && name[name.length - 1] === '_')) {
    return name.substring(1, name.length - 1);
  } else if (name[name.length - 1] === '?') {
    return name.substring(0, name.length - 1);
  }

  return false;
};

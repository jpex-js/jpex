import JpexError from '../Error';
import {
  Factory,
  JpexInstance,
} from '../types';
import { Lifecycle } from '../constants';
import {
  isNode,
  unsafeRequire,
  isString,
  getLast,
} from '../utils';

export const isValidFactory = (factory: Factory) => {
  if (!factory) {
    return false;
  }
  if (factory.resolved) {
    return true;
  }
  if (factory.fn && typeof factory.fn === 'function') {
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
    jpex.$$resolved[name] = {
      resolved: true,
      value,
    };
    break;
  case Lifecycle.NONE:
    break;
  case Lifecycle.INSTANCE:
  default:
    namedParameters[name] = value;
    break;
  }
};

export const checkOptional = (name: string) => {
  if (!isString(name)) {
    return false;
  }
  const first = name[0];
  const last = getLast(name);

  if (first === '_' && last === '_') {
    return name.substring(1, name.length - 1);
  }

  return false;
};

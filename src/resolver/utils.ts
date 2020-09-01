import {
  Factory,
  JpexInstance,
  ResolveOpts,
  NamedParameters,
  Dependency,
} from '../types';
import {
  isNode,
  unsafeRequire,
  getLast,
} from '../utils';
import { GLOBAL_TYPE_PREFIX } from '../constants';

const getFromNodeModules = (jpex: JpexInstance, target: string): Factory => {
  // in order to stop webpack environments from including every possible
  // import source in the bundle, we have to stick all node require stuff
  // inside an eval setup
  if (!isNode) {
    return;
  }
  if (!jpex.$$config.nodeModules) {
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

const getGlobalObject = (): any => {
  if (typeof global !== 'undefined') {
    // eslint-disable-next-line no-undef
    return global;
  }
  if (typeof globalThis !== 'undefined') {
    // eslint-disable-next-line no-undef
    return globalThis;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  return {};
};

const getGlobalProperty = (name: string) => {
  const global = getGlobalObject();
  if (global[name] !== void 0) {
    return global[name];
  }
  // we need to handle inferred types as well
  // this gets a little bit hacky...
  if (name.startsWith(GLOBAL_TYPE_PREFIX)) {
    // most global types will just be the name of the property in pascal case
    // i.e. window = Window / document = Document
    const inferredName = name.charAt(12).toLowerCase() + name.substr(13);
    return global[inferredName];
  }
};
const getFromGlobal = (jpex: JpexInstance, name: string): Factory => {
  if (!jpex.$$config.globals) {
    return;
  }

  const value = getGlobalProperty(name);

  if (value !== void 0) {
    jpex.constant(name, value);
    return jpex.$$factories[name];
  }
};

export const getFactory = (jpex: JpexInstance, name: string, opts: ResolveOpts) => {
  if (typeof name !== 'string') {
    throw new Error(`Name must be a string, but recevied ${typeof name}`);
  }
  let factory: Factory = jpex.$$resolved[name];
  if (factory != null) {
    return factory;
  }

  factory = jpex.$$factories[name];
  if (factory != null) {
    return factory;
  }

  factory = getFromGlobal(jpex, name);
  if (factory != null) {
    return factory;
  }

  factory = getFromNodeModules(jpex, name);
  if (factory != null) {
    return factory;
  }

  if (opts?.optional ?? jpex.$$config.optional) {
    return;
  }

  throw new Error(`Unable to find required dependency [${name}]`);
};

export const cacheResult = (
  jpex: JpexInstance,
  name: string,
  factory: Factory,
  value: any,
  namedParameters: NamedParameters,
) => {
  switch (factory.lifecycle) {
  case 'application':
    factory.resolved = true;
    factory.value = value;
    break;
  case 'class':
    jpex.$$resolved[name] = {
      resolved: true,
      value,
    } as Factory;
    break;
  case 'none':
    break;
  case 'instance':
  default:
    namedParameters[name] = value;
    break;
  }
};

// Ensure we're not stuck in a recursive loop
export const checkStack = (jpex: JpexInstance, name: Dependency, stack: string[]) => {
  if (!stack.length) {
    // This is the first loop
    return false;
  }
  if (!stack.includes(name)) {
    // We've definitely not tried to resolve this one before
    return false;
  }
  if (getLast(stack) === name) {
    // We've tried to resolve this one before, but...
    // if this factory has overridden a parent factory
    // we should assume it actually wants to resolve the parent
    const parent = jpex.$$parent?.$$factories[name];
    if (parent != null) {
      return true;
    }
  }
  throw new Error(`Recursive loop for dependency ${name} encountered`);
};

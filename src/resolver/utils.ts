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
  isString,
  hasLength,
} from '../utils';
import {
  GLOBAL_TYPE_PREFIX,
  VOID,
} from '../constants';

const getFromNodeModules = (jpex: JpexInstance, target: string): Factory => {
  // in order to stop webpack environments from including every possible
  // import source in the bundle, we have to stick all node require stuff
  // inside an eval setup
  if (!jpex.$$config.nodeModules) {
    return;
  }
  if (!isNode()) {
    return;
  }

  try {
    const value = unsafeRequire(target);
    jpex.constant(target, value);
    return jpex.$$factories[target];
  } catch (e) {
    if (e?.message?.includes?.(`Cannot find module '${target}'`)) {
      // not found in node modules, just continue
      return;
    }

    throw e;
  }
};

const getGlobalObject = (): any => {
  if (typeof global !== VOID) {
    // eslint-disable-next-line no-undef
    return global;
  }
  if (typeof globalThis !== VOID) {
    // eslint-disable-next-line no-undef
    return globalThis;
  }
  if (typeof window !== VOID) {
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
    const len = GLOBAL_TYPE_PREFIX.length;
    const inferredName = name.charAt(len).toLowerCase() + name.substr(len + 1);
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

const validateArgs = (name: string) => {
  if (!isString(name)) {
    throw new Error(`Name must be a string, but recevied ${typeof name}`);
  }
};

const getFromResolved = (jpex: JpexInstance, name: string) => {
  return jpex.$$resolved[name];
};

const getFromRegistry = (jpex: JpexInstance, name: string) => {
  return jpex.$$factories[name];
};

export const getFactory = (jpex: JpexInstance, name: string, opts: ResolveOpts) => {
  validateArgs(name);

  let factory: Factory = getFromResolved(jpex, name);
  if (factory != null) {
    return factory;
  }
  factory = getFromRegistry(jpex, name);
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
  if (!hasLength(stack)) {
    // This is the first loop
    return false;
  }
  if (!stack.includes(name)) {
    // We've definitely not tried to resolve this one before
    return false;
  }
  if (stack[stack.length - 1] === name) {
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

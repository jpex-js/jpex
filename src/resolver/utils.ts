import {
  Factory,
  JpexInstance,
  ResolveOpts,
  NamedParameters,
  Dependency,
} from '../types';
import { isNode, unsafeRequire, hasLength, validateName } from '../utils';
import { GLOBAL_TYPE_PREFIX, VOID } from '../constants';

const getFromNodeModules = (jpex: JpexInstance, target: string): Factory => {
  // in order to stop webpack environments from including every possible
  // import source in the bundle, we have to stick all node require stuff
  // inside an eval setup
  if (!jpex.$$config.nodeModules || !isNode()) {
    return;
  }

  try {
    const value = unsafeRequire(target);
    jpex.constant(target, value);
    return jpex.$$factories[target];
  } catch (e) {
    if (e.message?.includes?.(`Cannot find module '${target}'`)) {
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
    // sometimes though, like classes, the concrete name and type name are the same
    // i.e. the URL class
    const len = GLOBAL_TYPE_PREFIX.length;
    const inferred = name.substr(len);
    const inferredLower = inferred.charAt(0).toLowerCase() + inferred.substr(1);
    return global[inferredLower] ?? global[inferred];
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

const getFromAlias = (jpex: JpexInstance, alias: string) => {
  const name = jpex.$$alias[alias];
  if (name != null) {
    return jpex.$$factories[name];
  }
};

const getFromResolved = (jpex: JpexInstance, name: string) => {
  return jpex.$$resolved[name];
};

const getFromRegistry = (jpex: JpexInstance, name: string) => {
  return jpex.$$factories[name];
};

export const getFactory = (
  jpex: JpexInstance,
  name: string,
  opts: ResolveOpts = {},
) => {
  validateName(name);
  const fns = [
    getFromResolved,
    getFromRegistry,
    getFromAlias,
    getFromGlobal,
    getFromNodeModules,
  ];
  while (fns.length) {
    const factory = fns.shift()(jpex, name);
    if (factory != null) {
      return factory;
    }
  }

  if (opts.optional ?? jpex.$$config.optional) {
    return;
  }

  throw new Error(`Unable to find required dependency [${name}]`);
};

/* eslint-disable no-param-reassign */
export const cacheResult = (
  jpex: JpexInstance,
  name: string,
  factory: Factory,
  value: any,
  namedParameters: NamedParameters,
  withArg: Record<string, any>,
) => {
  switch (factory.lifecycle || jpex.$$config.lifecycle) {
    case 'application':
      factory.resolved = true;
      factory.value = value;
      factory.with = withArg;
      break;
    case 'class':
      jpex.$$resolved[name] = {
        ...factory,
        resolved: true,
        value,
        with: withArg,
      } as Factory;
      break;
    case 'none':
      break;
    case 'instance':
    default:
      // instance
      namedParameters[name] = value;
      break;
  }
};
/* eslint-enable no-param-reassign */

// Ensure we're not stuck in a recursive loop
export const checkStack = (
  jpex: JpexInstance,
  name: Dependency,
  stack: string[],
) => {
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

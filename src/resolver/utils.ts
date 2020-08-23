import {
  Factory,
  JpexInstance,
  ResolveOpts,
  NamedParameters,
} from '../types';
import {
  isNode,
  unsafeRequire,
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
  if (name.startsWith('type:global:')) {
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
  if (isValidFactory(factory)) {
    return factory;
  }

  factory = jpex.$$factories[name];
  if (isValidFactory(factory)) {
    return factory;
  }

  factory = getFromGlobal(jpex, name);
  if (isValidFactory(factory)) {
    return factory;
  }

  factory = getFromNodeModules(jpex, name);
  if (isValidFactory(factory)) {
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
    };
    break;
  case 'none':
    break;
  case 'instance':
  default:
    namedParameters[name] = value;
    break;
  }
};

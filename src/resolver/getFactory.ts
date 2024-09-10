import { Factory, JpexInstance, ResolveOpts } from '../types';
import { isNode, unsafeRequire, validateName } from '../utils';
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
    return global;
  }
  if (typeof globalThis !== VOID) {
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
    const inferred = name.substring(len);
    const inferredLower =
      inferred.charAt(0).toLowerCase() + inferred.substring(1);
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

const getFactory = (
  jpex: JpexInstance,
  name: string,
  opts: ResolveOpts = {},
): Factory | undefined => {
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

  if ('default' in opts) {
    return {
      fn: () => opts.default,
      lifecycle: jpex.$$config.lifecycle,
      resolved: true,
      value: opts.default,
    };
  }

  throw new Error(`Unable to find required dependency [${name}]`);
};

export default getFactory;

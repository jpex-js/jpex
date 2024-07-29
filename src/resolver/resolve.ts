import {
  JpexInstance,
  Dependency,
  NamedParameters,
  ResolveOpts,
  Factory,
} from '../types';
import { getFactory, cacheResult, checkStack } from './utils';
import { ensureArray, hasLength } from '../utils';
import { NAMED_PARAMS } from '../constants';

const getNamedParameters = (
  namedParameters: NamedParameters,
  opts: ResolveOpts = {},
) => {
  if (namedParameters) {
    return namedParameters;
  }
  if (opts.with) {
    return { ...opts.with };
  }
  return {};
};

const isResolvedWithParams = (factory: Factory, opts: ResolveOpts = {}) => {
  if (!factory.with && !opts.with) {
    return true;
  }
  const keys = [
    ...new Set([
      ...Object.keys(opts.with || {}),
      ...Object.keys(factory.with || {}),
    ]),
  ];
  return keys.every((key) => opts.with?.[key] === factory.with?.[key]);
};

const invokeFactory = (
  jpex: JpexInstance,
  name: string,
  factory: Factory,
  namedParameters: NamedParameters,
  opts: ResolveOpts,
  args: any[],
) => {
  // Invoke the factory
  const value = factory.fn.apply(jpex, args);
  // Cache the result
  cacheResult(jpex, name, factory, value, namedParameters, opts?.with);
  return value;
};

const resolveFactory = (
  jpex: JpexInstance,
  name: string,
  factory: Factory,
  namedParameters: NamedParameters,
  opts: ResolveOpts,
  stack: string[],
) => {
  if (factory == null) {
    return;
  }

  // Check if it's already been resolved
  if (factory.resolved && isResolvedWithParams(factory, opts)) {
    return factory.value;
  }

  // Work out dependencies
  let args: any[] | Promise<any> = [];

  if (hasLength(factory.dependencies)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    args = resolveMany(jpex, factory, namedParameters, opts, [...stack, name]);
  }

  if (args instanceof Promise) {
    return args.then((args) => {
      return invokeFactory(jpex, name, factory, namedParameters, opts, args);
    });
  }

  return invokeFactory(jpex, name, factory, namedParameters, opts, args);
};

export const resolveOne = (
  jpex: JpexInstance,
  name: Dependency,
  initialParameters: NamedParameters,
  opts: ResolveOpts,
  stack: string[],
): any | Promise<any> => {
  const namedParameters = getNamedParameters(initialParameters, opts);

  // Check named parameters
  // if we have a named parameter for this dependency
  // we don't need to do any resolution, we can just return the value
  if (Object.hasOwnProperty.call(namedParameters, name)) {
    return namedParameters[name];
  }

  // Special keys
  if (name === NAMED_PARAMS || name === jpex.infer<NamedParameters>()) {
    return namedParameters;
  }

  if (checkStack(jpex, name, stack)) {
    // Yes we have tried to resolve this one before, but we could
    // actually just be resolving an inherited factory
    return resolveOne(jpex.$$parent, name, namedParameters, opts, []);
  }

  // Get the factory
  // This will either return the factory,
  // return null (meaning it's an optional dependency)
  // or throw an error
  const factory = getFactory(jpex, name, opts);

  return resolveFactory(jpex, name, factory, namedParameters, opts, stack);
};

export const resolveMany = (
  jpex: JpexInstance,
  definition: Factory,
  namedParameters: NamedParameters,
  opts: ResolveOpts,
  stack: string[] = [],
): any[] | Promise<any[]> => {
  if (!hasLength(definition.dependencies)) {
    return [];
  }
  let isAsync = false;
  const dependencies: Dependency[] = ensureArray(definition.dependencies);

  const values = dependencies.map((dependency) => {
    const value = resolveOne(jpex, dependency, namedParameters, opts, stack);
    if (opts && opts.async && value instanceof Promise) {
      isAsync = true;
    }
    return value;
  });

  if (isAsync) {
    return Promise.all(values);
  }

  return values;
};

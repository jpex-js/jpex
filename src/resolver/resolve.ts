import {
  JpexInstance,
  Dependency,
  NamedParameters,
  ResolveOpts,
  Factory,
} from '../types';
import getFactory from './getFactory';
import { ensureArray, hasLength, last, unique } from '../utils';
import { NAMED_PARAMS } from '../constants';

// Ensure we're not stuck in a recursive loop
const checkStack = (
  jpex: JpexInstance,
  name: Dependency,
  stack: string[],
): 'new' | 'inherit' | 'recursive' => {
  if (!hasLength(stack)) {
    // This is the first loop
    return 'new';
  }
  if (!stack.includes(name)) {
    // We've definitely not tried to resolve this one before
    return 'new';
  }
  if (last(stack) === name) {
    // We've tried to resolve this one before, but...
    // if this factory has overridden a parent factory
    // we should assume it actually wants to resolve the parent
    const parent = jpex.$$parent?.$$factories[name];
    if (parent != null) {
      return 'inherit';
    }
  }
  return 'recursive';
};

// Cache the result of resolving a factory
export const cacheResult = (
  jpex: JpexInstance,
  name: string,
  factory: Factory,
  value: any,
  namedParameters: NamedParameters,
  withArg: Record<string, any>,
) => {
  switch (factory.lifecycle || jpex.$$config.lifecycle) {
    case 'singleton':
      // Cache the result against the factory itself
      // so it is shared across all instances that use that factory
      factory.resolved = true;
      factory.value = value;
      factory.with = withArg;
      // Also store the result in the namedParameters for a quick look-up
      namedParameters[name] = value;
      break;
    case 'container':
      // Cache the result against the current instance
      // so it is shared across this instance and all child instances, but not parent instances
      jpex.$$resolved[name] = {
        ...factory,
        resolved: true,
        value,
        with: withArg,
      } as Factory;
      // Also store the result in the namedParameters for a quick look-up
      namedParameters[name] = value;
      break;
    case 'none':
      // Do not cache the result at all
      break;
    case 'invocation':
    default:
      // Cache the result for the duration of the current resolution
      // so if two dependencies share the same dependency it will re-use it
      // but if the same dependency is resolved again later it will be re-resolved
      namedParameters[name] = value;
      break;
  }
};

// Get named parameters, these will either be custom dependencies passed in at resolve time,
// or dependencies that were resolved during the current resolution
const getNamedParameters = (
  namedParameters: NamedParameters,
  opts: ResolveOpts = {},
) => {
  if (namedParameters) {
    // Use existing named parameters
    return namedParameters;
  }
  if (opts.with) {
    // Use custom named parameters
    return { ...opts.with };
  }
  // Create a new parameters object to use just for this resolution
  return {};
};

// Check if the factory has already been resolved with the same parameters
// If it has, we can re-use the reoslved value, otherwise we need to re-resolve and re-cache with the new parameters
const isResolvedWithParams = (factory: Factory, opts: ResolveOpts = {}) => {
  if (!factory.with && !opts.with) {
    return true;
  }
  const keys = unique([
    ...Object.keys(opts.with || {}),
    ...Object.keys(factory.with || {}),
  ]);
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

  // Handle async factories by waiting for the dependencies to resolve
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

  switch (checkStack(jpex, name, stack)) {
    case 'inherit':
      return resolveOne(jpex.$$parent, name, namedParameters, opts, []);
    case 'recursive':
      throw new Error(`Recursive loop for dependency ${name} encountered`);
    case 'new':
    default:
      // All good
      break;
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

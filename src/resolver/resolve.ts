import {
  JpexInstance,
  Dependency,
  Definition,
  Options,
  NamedParameters,
} from '../types';
import JpexError from '../Error';
import {
  checkOptional,
  getFactory,
  cacheResult,
} from './utils';
import {
  hasOwn,
  isObject,
  getLast,
} from '../utils';

export const resolveOne = <R extends any>(
  jpex: JpexInstance,
  name: Dependency,
  localOptions: any,
  namedParameters: { [key: string]: any },
  stack: string[],
): R => {
  if (isObject(name)) {
    console.warn('jpex: $options style has been deprecated and will be removed in v4.0.0');
    const key = Object.keys(name)[0];
    return resolveOne(jpex, key, name[key], namedParameters, stack);
  }
  if (!namedParameters) {
    namedParameters = {};
  }

  // Optional dependencies
  let optional = false;
  const optionalCheck = checkOptional(name);
  if (optionalCheck) {
    console.warn('jpex: __ optional syntax has been deprecated and will be removed in v4.0.0');
    name = optionalCheck;
    optional = true;
  }

  // Check named parameters
  // if we have a named parameter for this dependency
  // we don't need to do any resolution, we can just return the value
  if (hasOwn(namedParameters, name)) {
    return namedParameters[name];
  }

  // Special keys
  switch (name) {
  case '$options':
  case jpex.infer<Options>():
    console.warn('jpex: $options style has been deprecated and will be removed in v4.0.0');
    return localOptions;
  case '$namedParameters':
  case jpex.infer<NamedParameters>():
    // @ts-ignore
    return namedParameters;
  default:
    break;
  }

  // Ensure we're not stuck in a recursive loop
  if (stack.indexOf(name) > -1) {
    if (getLast(stack) === name) {
      if (jpex.$$parent?.$$factories[name]) {
        return resolveOne(jpex.$$parent, name, localOptions, namedParameters, []);
      }
    }
    throw new JpexError(`Recursive loop for dependency ${name} encountered`);
  }

  // Get the factory
  // This will either return the factory,
  // return null (meaning it's an optional dependency)
  // or throw an error
  const factory = getFactory(jpex, name, optional);
  if (!factory) {
    return;
  }

  // Check if it's already been resolved
  if (factory.resolved) {
    return factory.value;
  }

  // Work out dependencies
  let args: any[] = [];

  if (factory?.dependencies?.length) {
    try {
      // eslint-disable-next-line no-use-before-define
      args = resolveMany(jpex, factory, namedParameters, localOptions, stack.concat(name));
    } catch (e) {
      if (!optional) {
        throw e;
      }
      return;
    }
  }

  // Invoke the factory
  const value = factory.fn.apply(jpex, args);
  // Cache the result
  cacheResult(jpex, name, factory, value, namedParameters);

  return value;
};

export const resolveMany = <R extends any[]>(
  jpex: JpexInstance,
  definition: Definition,
  namedParameters: { [key: string]: any },
  globalOptions: any,
  stack: string[],
): R => {
  if (!definition?.dependencies) {
    return [] as R;
  }
  if (!stack) {
    stack = [];
  }
  if (!namedParameters) {
    namedParameters = {};
  }
  const dependencies: Dependency[] = [].concat(definition.dependencies);

  const values = dependencies.reduce((value: Dependency[], dependency): Dependency[] => {
    if (isObject(dependency)) {
      console.warn('jpex: $options style has been deprecated and will be removed in v4.0.0');
      const keys = Object.keys(dependency);
      const x = keys.reduce((value, key) => {
        const options = dependency[key];
        const y = resolveOne(jpex, key, options, namedParameters, stack);
        return value.concat(y);
      }, []);
      return value.concat(x);
    }
    const x = resolveOne(jpex, dependency, globalOptions, namedParameters, stack);
    return value.concat([ x ]);
  }, [] as Dependency[]);

  return values as R;
};

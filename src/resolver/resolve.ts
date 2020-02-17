import {
  JpexInstance,
  Dependency,
  Definition,
} from '../types';
import JpexError from '../Error';
import {
  checkOptional,
  getFactory,
  runDecorators,
  cacheResult,
} from './utils';
import {
  hasOwn,
  isObject,
  isSymbol,
} from '../utils';

export const resolveOne = <R extends any>(
  jpex: JpexInstance,
  name: Dependency,
  localOptions: any,
  namedParameters: { [key: string]: any },
  stack: Dependency[],
): R => {
  if (isObject(name)) {
    const key = Object.keys(name)[0];
    return resolveOne(jpex, key, name[key], namedParameters, stack);
  }
  if (!namedParameters) {
    namedParameters = {};
  }

  // Optional dependencies
  const optionalCheck = checkOptional(name);
  let optional = false;
  if (optionalCheck) {
    name = optionalCheck;
    optional = true;
  }

  // Check named parameters
  // if we have a named parameter for this dependency
  // we don't need to do any resolution, we can just return the value
  if (hasOwn(namedParameters, name as string)) {
    return namedParameters[name as string];
  }

  // Special keys
  switch (name) {
  case '$options':
    return localOptions;
  case '$namedParameters':
    // @ts-ignore
    return namedParameters;
  default:
    break;
  }

  // Ensure we're not stuck in a recursive loop
  if (stack.indexOf(name) > -1) {
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

  if (factory.dependencies && factory.dependencies.length) {
    try {
      // @ts-ignore
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
  let value = factory.fn.apply(jpex, args);
  // Process decorators
  value = runDecorators(jpex, value, factory.decorators);
  // Cache the result
  cacheResult(jpex, name, factory, value, namedParameters);

  return value;
};

export const resolveMany = <R extends any[]>(
  jpex: JpexInstance,
  definition: Definition,
  namedParameters: { [key: string]: any },
  globalOptions: any,
  stack: Dependency[],
): R => {
  if (!definition || !definition.dependencies) {
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
    if (isObject(dependency) && !isSymbol(dependency)) {
      const keys = Object.keys(dependency);
      const x = keys.reduce((value, key) => {
        const options = dependency[key];
        const y = resolveOne(jpex, key, options, namedParameters, stack);
        return value.concat(y);
      }, []);
      return value.concat(x);
    }
    const x = resolveOne(jpex, dependency, globalOptions, namedParameters, stack);
    return value.concat(x);
  }, [] as Dependency[]);

  return values as R;
};
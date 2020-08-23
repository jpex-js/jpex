import {
  JpexInstance,
  Dependency,
  Definition,
  NamedParameters,
  ResolveOpts,
} from '../types';
import {
  getFactory,
  cacheResult,
} from './utils';
import {
  hasOwn,
  getLast,
} from '../utils';

export const resolveOne = <R extends any>(
  jpex: JpexInstance,
  name: Dependency,
  namedParameters: NamedParameters,
  opts: ResolveOpts,
  stack: string[],
): R => {
  if (!namedParameters) {
    namedParameters = opts?.with ?? {};
  }

  // Check named parameters
  // if we have a named parameter for this dependency
  // we don't need to do any resolution, we can just return the value
  if (hasOwn(namedParameters, name)) {
    return namedParameters[name];
  }

  // Special keys
  switch (name) {
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
        return resolveOne(jpex.$$parent, name, namedParameters, opts, []);
      }
    }
    throw new Error(`Recursive loop for dependency ${name} encountered`);
  }

  // Get the factory
  // This will either return the factory,
  // return null (meaning it's an optional dependency)
  // or throw an error
  const factory = getFactory(jpex, name, opts);
  if (!factory) {
    return;
  }

  // Check if it's already been resolved
  if (factory.resolved) {
    return factory.value;
  }

  // Work out dependencies
  let args: any[] = [];

  if (factory.dependencies?.length) {
    // eslint-disable-next-line no-use-before-define
    args = resolveMany(jpex, factory, namedParameters, opts, stack.concat(name));
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
  opts: ResolveOpts,
  stack: string[],
): R => {
  if (!definition?.dependencies?.length) {
    return [] as R;
  }
  if (!stack) {
    stack = [];
  }
  if (!namedParameters) {
    namedParameters = opts?.with ?? {};
  }
  const dependencies: Dependency[] = [].concat(definition.dependencies);

  const values = dependencies.reduce((value: Dependency[], dependency): Dependency[] => {
    const x = resolveOne<any>(jpex, dependency, namedParameters, opts, stack);
    return value.concat([ x ]);
  }, [] as Dependency[]);

  return values as R;
};

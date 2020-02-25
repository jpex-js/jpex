import {
  JpexInstance,
  Definition,
  Dependency,
} from '../types';
import {
  resolveMany,
  resolveOne,
} from './resolve';
import {
  isString,
} from '../utils';

export const resolve = (
  jpex: JpexInstance,
  name: Dependency,
  namedParameters?: { [key: string]: any },
) => resolveOne(
  jpex,
  name,
  null,
  namedParameters,
  [],
);

export const resolveDependencies = (
  jpex: JpexInstance,
  definition: Definition,
  namedParameters?: { [key: string]: any },
) => {
  return resolveMany(
    jpex,
    definition,
    namedParameters,
    void 0,
    [],
  );
};

export const isResolved = (jpex: JpexInstance, dependency: Dependency) => {
  if (!isString(dependency)) {
    return false;
  }
  if (jpex.$$resolved[dependency]) {
    return true;
  }
  if (jpex.$$factories[dependency]?.resolved) {
    return true;
  }
  return false;
};

export const allResolved = (jpex: JpexInstance, dependencies: Dependency[]) => {
  return dependencies.every(isResolved.bind(null, jpex));
};

import {
  JpexInstance,
  Definition,
  Dependency,
  ResolveOpts,
} from '../types';
import {
  resolveMany,
  resolveOne,
} from './resolve';
import {
  isString,
} from '../utils';

export { getFactory } from './utils';

export const resolve = (
  jpex: JpexInstance,
  name: Dependency,
  opts?: ResolveOpts,
) => resolveOne(jpex, name, void 0, opts, []);

export const resolveDependencies = (
  jpex: JpexInstance,
  definition: Definition,
  opts?: ResolveOpts,
) => {
  return resolveMany(jpex, definition, void 0, opts, []);
};

export const isResolved = (jpex: JpexInstance, dependency: Dependency) => {
  if (!isString(dependency)) {
    return false;
  }
  if (jpex.$$resolved[dependency] != null) {
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

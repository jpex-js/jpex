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

export function resolve(
  this: JpexInstance,
  name: Dependency,
  opts?: ResolveOpts,
) {
  return resolveOne(this, name, void 0, opts, []);
}

export function resolveDependencies(
  this: JpexInstance,
  definition: Definition,
  opts?: ResolveOpts,
) {
  return resolveMany(this, definition, void 0, opts, []);
}

export function isResolved(this: JpexInstance, dependency: Dependency) {
  if (!isString(dependency)) {
    return false;
  }
  if (this.$$resolved[dependency] != null) {
    return true;
  }
  if (this.$$factories[dependency]?.resolved) {
    return true;
  }
  return false;
}

export function allResolved(this: JpexInstance, dependencies: Dependency[]) {
  return dependencies.every(isResolved.bind(this));
}

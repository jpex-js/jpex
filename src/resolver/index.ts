import { JpexInstance, Dependency, ResolveOpts, Factory } from '../types';
import { resolveMany, resolveOne } from './resolve';
import { isString } from '../utils';

export { getFactory } from './utils';

export function resolve(
  this: JpexInstance,
  name: Dependency,
  opts?: ResolveOpts,
) {
  return resolveOne(this, name, void 0, opts, []);
}

export function resolveAsync(
  this: JpexInstance,
  name: Dependency,
  opts?: ResolveOpts,
) {
  return resolveOne(this, name, void 0, { ...opts, async: true }, []);
}

export function resolveDependencies(
  this: JpexInstance,
  definition: Factory,
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
  return this.$$factories[dependency]?.resolved === true;
}

export function allResolved(this: JpexInstance, dependencies: Dependency[]) {
  return dependencies.every(isResolved.bind(this));
}

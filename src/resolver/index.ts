import { JpexInstance, Dependency, ResolveOpts, Factory } from '../types';
import { resolveMany, resolveOne } from './resolve';
import { isString, trackDeps } from '../utils';

export { default as getFactory } from './getFactory';

export function resolve(
  this: JpexInstance,
  name: Dependency,
  opts?: ResolveOpts,
) {
  trackDeps(this, [name]);
  return resolveOne(this, name, void 0, opts, []);
}

export function resolveAsync(
  this: JpexInstance,
  name: Dependency,
  opts?: ResolveOpts,
) {
  trackDeps(this, [name]);
  return resolveOne(this, name, void 0, { ...opts, async: true }, []);
}

export function resolveDependencies(
  this: JpexInstance,
  definition: Factory,
  opts?: ResolveOpts,
) {
  trackDeps(this, definition.dependencies);
  return resolveMany(this, definition, void 0, opts, []);
}

export function isResolved(this: JpexInstance, dependency: Dependency) {
  if (!isString(dependency)) {
    return false;
  }
  if (this.$$resolved[dependency] != null) {
    return true;
  }
  if (this.$$factories[dependency]) {
    return this.$$factories[dependency].resolved === true;
  }
  return false;
}

export function allResolved(this: JpexInstance, dependencies: Dependency[]) {
  return dependencies.every(isResolved.bind(this));
}

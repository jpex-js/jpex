import { JpexInstance, Dependency, AnyFunction } from './types';
import { allResolved, resolveDependencies } from './resolver';
import { trackDeps } from './utils';

export default function encase<F extends AnyFunction<F>>(
  this: JpexInstance,
  dependencies: Dependency[],
  fn: F,
): any {
  // We want to alias this here because we'll end up with 2 this contexts
  // 1 for the outer function that resolves its dependencies, then another for the inner function
  // that runs the original method. The inner function uses both this contexts
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const jpex = this;
  let result: AnyFunction;

  trackDeps(jpex, dependencies);

  const invokeFn = (deps: any[], args: any[]) => {
    result = fn.apply(jpex, deps);

    return result.apply(this, args);
  };

  const encased = function encased(...args: Parameters<F>) {
    if (result && allResolved.call(jpex, dependencies)) {
      return result.apply(this, args);
    }
    const deps = resolveDependencies.call(
      jpex,
      { dependencies },
      { async: true },
    );

    if (deps instanceof Promise) {
      return deps.then((deps) => invokeFn(deps, args));
    }

    return invokeFn(deps, args);
  };
  encased.encased = fn;

  return encased;
}

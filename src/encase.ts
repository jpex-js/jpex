import { JpexInstance, Dependency, AnyFunction } from './types';
import { allResolved, resolveDependencies } from './resolver';

export default function encase<F extends AnyFunction<F>>(
  this: JpexInstance,
  dependencies: Dependency[],
  fn: F,
): any {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const jpex = this;
  let result: AnyFunction;

  const invokeFn = (deps: any[], args: any[]) => {
    result = fn.apply(jpex, deps);

    return result.apply(this, args);
  };

  const encased = function encased(...args: Parameters<F>) {
    /* eslint-disable no-invalid-this */
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
    /* eslint-enable */
  };
  encased.encased = fn;

  return encased;
}

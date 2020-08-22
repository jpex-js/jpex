import { JpexInstance, Dependency, AnyFunction } from './types';
import { allResolved, resolveDependencies } from './resolver';

const encase = <F extends AnyFunction<F>>(
  jpex: JpexInstance,
  dependencies: Dependency[],
  fn: F,
): any => {
  let result: AnyFunction;

  const encased = function(...args: Parameters<F>) {
    /* eslint-disable no-invalid-this */
    if (result && allResolved(jpex, dependencies)) {
      return result.apply(this, args);
    }
    const deps = resolveDependencies(jpex, { dependencies });

    result = fn.apply(this, deps);

    return result.apply(this, args);
    /* eslint-enable */
  };
  encased.encased = fn;

  return encased;
};

export default encase;

import { JpexInstance, Dependency, AnyFunction } from './types';
import { allResolved, resolveDependencies } from './resolver';

const encase = <F extends AnyFunction, G extends AnyFunction<F>>(
  jpex: JpexInstance,
  _deps: any,
  _fn?: any,
): any => {
  const [ dependencies, fn ] = ((): [ Dependency[], G ] => {
    if (typeof _deps === 'function') {
      return [ [], _deps ];
    }
    return [ _deps, _fn ];
  })();
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

import { JpexInstance, Dependency, AnyFunction } from './types';
import { extractParameters } from './utils';
import { allResolved, resolveDependencies } from './resolver';

const encase = (
  jpex: JpexInstance,
  _deps: string[],
  _fn?: any,
): any => {
  const [ dependencies, fn ] = ((): [ Dependency[], any ] => {
    if (typeof _deps === 'function') {
      return [ extractParameters(_deps), _deps ];
    }
    return [ _deps, _fn ];
  })();
  let result: AnyFunction;

  const encased = function(...args: Parameters<any>) {
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

import { JpexInstance, Factory } from '../types';
import wrapper, { Wrapper } from './wrapper';
import { extractParameters, isString, isFunction } from '../utils';

function factory(
  jpex: JpexInstance,
  name: any,
  dependencies: any,
  fn?: any,
): Wrapper {
  if (!isString(name)) {
    throw new Error(`Factories must be given a name, but was called with [${typeof name}]`);
  }
  if (isFunction(dependencies)) {
    fn = dependencies;
    dependencies = void 0;
  }
  if (!isFunction(fn)) {
    throw new Error(`Factory ${name} must be a [Function]`);
  }
  if (dependencies) {
    dependencies = [].concat(dependencies);
  } else {
    dependencies = extractParameters(fn);
  }
  if (!dependencies.length) {
    dependencies = null;
  }

  const f: Factory = {
    fn,
    dependencies,
    lifecycle: jpex.$$defaultLifecycle,
  };
  jpex.$$factories[name as string] = f;

  return wrapper(f);
}

export default factory;

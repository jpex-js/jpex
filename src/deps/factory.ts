import { JpexInstance, Factory } from '../types';
import wrapper, { Wrapper } from './wrapper';
import { extractParameters } from '../utils';

function factory(
  jpex: JpexInstance,
  name: any,
  dependencies: any,
  fn?: any,
): Wrapper {
  if (typeof name !== 'string') {
    throw new Error(`Factories must be given a name, but was called with [${typeof name}]`);
  }
  if (typeof dependencies === 'function') {
    fn = dependencies;
    dependencies = void 0;
  }
  if (typeof fn !== 'function') {
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

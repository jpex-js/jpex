import { JpexInstance } from '../types';
import { extractParameters, instantiate } from '../utils';

function service(
  jpex: JpexInstance,
  name: any,
  dependencies: any,
  fn?: any,
) {
  if (typeof dependencies === 'function') {
    fn = dependencies;
    dependencies = void 0;
  }
  if (typeof fn !== 'function') {
    throw new Error(`Service ${name} must be a [Function]`);
  }

  if (dependencies) {
    dependencies = [].concat(dependencies);
  } else {
    dependencies = extractParameters(fn);
  }

  function factory(...args: any[]) {
    const context = {} as any;

    if (factory.bindToInstance) {
      (dependencies as string[]).forEach((key, i) => {
        context[key] = args[i];
      });
      fn.apply(context, args);
      return context;
    }

    args.unshift(context);
    return instantiate(fn, args);
  }
  factory.bindToInstance = false;

  return jpex.factory(name, dependencies, factory);
}

export default service;

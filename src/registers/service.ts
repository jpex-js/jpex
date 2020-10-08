import { JpexInstance, Dependency, ServiceOpts } from '../types';
import { instantiate, isFunction } from '../utils';

const validateArgs = (name: string, fn: any) => {
  if (!isFunction(fn)) {
    throw new Error(`Factory ${name} must be a [Function]`);
  }
};

function service(
  jpex: JpexInstance,
  name: string,
  dependencies: Dependency[],
  fn: any,
  opts?: ServiceOpts,
) {
  validateArgs(name, fn);

  function factory(...args: any[]) {
    const context = {} as any;

    if (opts?.bindToInstance) {
      dependencies.forEach((key, i) => {
        context[key] = args[i];
      });
    }

    args.unshift(context);
    return instantiate(fn, args);
  }

  return jpex.factory(name, dependencies, factory, opts);
}

export default service;

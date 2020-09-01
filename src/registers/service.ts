import { JpexInstance, Dependency, ServiceOpts } from '../types';
import { instantiate, isFunction } from '../utils';

function service(
  jpex: JpexInstance,
  name: string,
  dependencies: Dependency[],
  fn: any,
  opts?: ServiceOpts,
) {
  if (!isFunction(fn)) {
    throw new Error(`Service ${name} must be a [Function]`);
  }

  function factory(...args: any[]) {
    const context = {} as any;

    if (opts?.bindToInstance) {
      (dependencies).forEach((key, i) => {
        context[key] = args[i];
      });
    }

    args.unshift(context);
    return instantiate(fn, args);
  }

  return jpex.factory(name, dependencies, factory, opts);
}

export default service;

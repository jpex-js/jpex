import { JpexInstance, Dependency, ServiceOpts } from '../types';
import { instantiate } from '../utils';
import { validateArgs } from './factory';

function service(
  this: JpexInstance,
  name: string,
  dependencies: Dependency[],
  fn: any,
  opts: ServiceOpts = {},
) {
  validateArgs(name, dependencies, fn);

  function factory(...args: any[]) {
    const context = {} as any;

    if (opts.bindToInstance) {
      dependencies.forEach((key, i) => {
        context[key] = args[i];
      });
    }

    return instantiate(fn, [ context, ...args ]);
  }

  return this.factory(name, dependencies, factory, opts);
}

export default service;

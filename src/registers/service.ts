import { JpexInstance } from '../types';
import { instantiate, isFunction } from '../utils';

function service(
  jpex: JpexInstance,
  name: any,
  dependencies: any,
  fn?: any,
) {
  if (isFunction(dependencies)) {
    fn = dependencies;
    dependencies = void 0;
  }
  if (!isFunction(fn)) {
    throw new Error(`Service ${name} must be a [Function]`);
  }

  if (dependencies) {
    dependencies = [].concat(dependencies);
  } else {
    dependencies = [];
  }

  function factory(...args: any[]) {
    const context = {} as any;

    if (factory.bindToInstance) {
      (dependencies as string[]).forEach((key, i) => {
        context[key] = args[i];
      });
    }

    args.unshift(context);
    return instantiate(fn, args);
  }
  factory.bindToInstance = false;

  return jpex.factory(name, dependencies, factory);
}

export default service;

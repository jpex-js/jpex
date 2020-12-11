import { JpexInstance, Factory, Dependency, AnyFunction, FactoryOpts } from '../types';
import { isString, isFunction, hasLength, ensureArray } from '../utils';

export const validateArgs = (name: string, dependencies: Dependency[], fn: AnyFunction) => {
  if (!isString(name)) {
    throw new Error(`Factories must be given a name, but was called with [${typeof name}]`);
  }
  if (!Array.isArray(dependencies)) {
    throw new Error(`Expected an array of dependencies, but was called with [${typeof dependencies}]`);
  }
  if (!isFunction(fn)) {
    throw new Error(`Factory ${name} must be a [Function]`);
  }
};

export default function factory <T>(
  this: JpexInstance,
  name: string,
  dependencies: Dependency[],
  fn: AnyFunction<T>,
  opts: FactoryOpts = {},
) {
  validateArgs(name, dependencies, fn);

  if (!hasLength(dependencies)) {
    dependencies = null;
  }

  // eslint-disable-next-line max-len
  if ((opts.precedence || this.$$config.precedence) === 'passive' && this.$$factories[name] != null) {
    return;
  }

  const f: Factory = {
    fn,
    dependencies,
    lifecycle: opts.lifecycle || this.$$config.lifecycle,
  };
  this.$$factories[name] = f;

  if (opts.alias) {
    ensureArray(opts.alias).forEach(alias => this.alias(alias, name));
  }
}

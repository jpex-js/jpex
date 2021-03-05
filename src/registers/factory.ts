import { JpexInstance, Dependency, AnyFunction, FactoryOpts } from '../types';
import { hasLength, ensureArray, isPassive, validateArgs } from '../utils';

export default function factory<T>(
  this: JpexInstance,
  name: string,
  dependencies: Dependency[],
  fn: AnyFunction<T>,
  opts: FactoryOpts = {},
) {
  validateArgs(name, dependencies, fn);

  if (!hasLength(dependencies)) {
    // eslint-disable-next-line no-param-reassign
    dependencies = null;
  }

  if (isPassive(name, this, opts.precedence)) {
    return;
  }

  this.$$factories[name] = {
    fn,
    dependencies,
    lifecycle: opts.lifecycle || this.$$config.lifecycle,
  };

  if (opts.alias) {
    ensureArray(opts.alias).forEach((alias) => this.alias(alias, name));
  }
}

import { JpexInstance, Factory, Dependency, AnyFunction, FactoryOpts } from '../types';
import { isString, isFunction } from '../utils';

function factory <T>(
  jpex: JpexInstance,
  name: string,
  dependencies: Dependency[],
  fn: AnyFunction<T>,
  opts?: FactoryOpts,
) {
  if (!isString(name)) {
    throw new Error(`Factories must be given a name, but was called with [${typeof name}]`);
  }
  if (!Array.isArray(dependencies)) {
    throw new Error(`Expected an array of dependencies, but was called with [${typeof dependencies}]`);
  }
  if (!isFunction(fn)) {
    throw new Error(`Factory ${name} must be a [Function]`);
  }
  if (!dependencies.length) {
    dependencies = null;
  }

  const precedence = opts?.precedence ?? jpex.$$config.precedence;

  if (precedence === 'passive' && jpex.$$factories[name]) {
    return;
  }

  const f: Factory = {
    fn,
    dependencies,
    lifecycle: opts?.lifecycle ?? jpex.$$config.lifecycle,
  };
  jpex.$$factories[name] = f;
}

export default factory;

import { JpexInstance, Factory, Dependency, AnyFunction, FactoryOpts } from '../types';
import { isString, isFunction, hasLength } from '../utils';

const validateArgs = (name: string, dependencies: Dependency[], fn: AnyFunction) => {
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

function factory <T>(
  jpex: JpexInstance,
  name: string,
  dependencies: Dependency[],
  fn: AnyFunction<T>,
  opts?: FactoryOpts,
) {
  validateArgs(name, dependencies, fn);

  if (!hasLength(dependencies)) {
    dependencies = null;
  }

  const precedence = opts?.precedence ?? jpex.$$config.precedence;
  const lifecycle = opts?.lifecycle ?? jpex.$$config.lifecycle;

  if (precedence === 'passive' && jpex.$$factories[name] != null) {
    return;
  }

  const f: Factory = {
    fn,
    dependencies,
    lifecycle,
  };
  jpex.$$factories[name] = f;
}

export default factory;

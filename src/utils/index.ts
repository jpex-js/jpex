import { Dependency, JpexInstance, Precedence } from '../types';

export const isString = (obj: any): obj is string => typeof obj === 'string';
export const isFunction = (obj: any): obj is (...args: any[]) => any =>
  typeof obj === 'function';

export const validateName = (name: string) => {
  if (!isString(name)) {
    throw new Error(`Name must be a string, but recevied ${typeof name}`);
  }
};
export const validateDependencies = (dependencies: Dependency[]) => {
  if (!Array.isArray(dependencies)) {
    throw new Error(
      `Expected an array of dependencies, but was called with [${typeof dependencies}]`,
    );
  }
};
export const validateFactory = (name: string, fn: (...args: any[]) => any) => {
  if (!isFunction(fn)) {
    throw new Error(`Factory ${name} must be a [Function]`);
  }
};
export const validateArgs = (
  name: string,
  dependencies: Dependency[],
  fn: (...args: any[]) => any,
) => {
  validateName(name);
  validateDependencies(dependencies);
  validateFactory(name, fn);
};

export const isPassive = (
  name: string,
  jpex: JpexInstance,
  precedence?: Precedence,
) => {
  return (
    (precedence || jpex.$$config.precedence) === 'passive' &&
    jpex.$$factories[name] != null
  );
};

export const instantiate = (context: any, args: any[]) => {
  // eslint-disable-next-line new-parens
  return new (Function.prototype.bind.apply(context, args))();
};

export const isNode = () => {
  let _process; // eslint-disable-line no-underscore-dangle

  try {
    // eslint-disable-next-line no-new-func
    _process = new Function('return process')();
  } catch (e) {
    // No process
  }

  // eslint-disable-next-line max-len
  return (
    typeof _process === 'object' &&
    _process.toString &&
    _process.toString() === '[object process]'
  );
};

// eslint-disable-next-line no-new-func
const doUnsafeRequire = new Function(
  'require',
  'target',
  'return require.main.require(target)',
);
export const unsafeRequire = (target: string) => {
  // eslint-disable-next-line no-eval
  return doUnsafeRequire(eval('require'), target);
};

export const ensureArray = <T>(arr: T[] | T): T[] => {
  if (arr == null) {
    return [];
  }
  if (Array.isArray(arr)) {
    return arr;
  }
  return [arr];
};

export const hasLength = <T>(arr: T[]) => arr != null && arr.length > 0;

const getType = (obj: any) => Object.prototype.toString.call(obj);
export const isObject = (obj: any): obj is object => getType(obj) === '[object Object]';

export const isSymbol = (obj: any): boolean => getType(obj) === '[object Symbol]';
export const isString = (obj: any): obj is string => typeof obj === 'string';
export const isFunction = (obj: any): obj is Function => typeof obj === 'function';

export const hasOwn = <T>(obj: T, name: string | Symbol): boolean => {
  return Object.hasOwnProperty.call(obj, name);
};

export const instantiate = (context: any, args: any[]) => {
  // eslint-disable-next-line new-parens
  return new (Function.prototype.bind.apply(context, args));
};

export const isNode = (() => {
  let _process; // eslint-disable-line no-underscore-dangle

  try {
    // eslint-disable-next-line no-new-func
    _process = new Function('return process')();
  } catch (e) {
    // No process
  }

  // eslint-disable-next-line max-len
  return typeof _process === 'object' && _process.toString && _process.toString() === '[object process]';
})();

// eslint-disable-next-line no-new-func
const doUnsafeRequire = new Function('require', 'target', 'return require.main.require(target)');
export const unsafeRequire = (target: string) => {
  // eslint-disable-next-line no-eval
  return doUnsafeRequire(eval('require'), target);
};

interface GetLast {
  (str: string): string,
  <T>(arr: T[]): T,
}
export const getLast: GetLast = (arr: any[] | string) => arr[arr.length - 1];

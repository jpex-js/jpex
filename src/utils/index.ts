export const isString = (obj: any): obj is string => typeof obj === 'string';
export const isFunction = (obj: any): obj is Function => typeof obj === 'function';

export const instantiate = (context: any, args: any[]) => {
  // eslint-disable-next-line new-parens
  return new (Function.prototype.bind.apply(context, args));
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
  return typeof _process === 'object' && _process.toString && _process.toString() === '[object process]';
};

// eslint-disable-next-line no-new-func
const doUnsafeRequire = new Function('require', 'target', 'return require.main.require(target)');
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
  return [ arr ];
};

export const hasLength = <T>(arr: T[]) => arr == null || arr.length > 0;

import { AnyFunction } from '../types';

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
    _process = eval('process'); // eslint-disable-line no-eval
  } catch (e) {
    // No process
  }

  // eslint-disable-next-line max-len
  return typeof _process === 'object' && _process.toString && _process.toString() === '[object process]';
})();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const unsafeRequire = (target: string) => {
  return eval('require.main.require(target)'); // eslint-disable-line no-eval
};

const REG_COMMENTS = /\/\/(.*?)\n|\/\*([\S\s]*?)\*\//g;
export const extractParameters = (fn: AnyFunction) => {
  const CHR_OPEN = '(';
  const CHR_CLOSE = ')';
  const CHR_ARROW = '=>';
  const CHR_DELIMETER = ',';

  let str = fn.toString();

  // Remove comments
  str = str.replace(REG_COMMENTS, '');

  // Find the start and end of the parameters
  const open = str.indexOf(CHR_OPEN);
  const close = str.indexOf(CHR_CLOSE);
  const arrow = str.indexOf(CHR_ARROW);

  // Arrow functions may or may not contain brackets
  if (arrow > -1 && (arrow < open || open < 0)) {
    str = str.substring(0, arrow).trim();
    if (!str) {
      return [];
    }
    return [ str ];
  }

  // Pull out the parameters
  str = str.substring(open + 1, close);

  if (!str) {
    return [];
  }

  return str.split(CHR_DELIMETER).map((s) => s.trim());
};

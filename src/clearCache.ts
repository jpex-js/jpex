import { JpexInstance } from './types';
import { ensureArray, hasLength } from './utils';

const clearCache = (jpex: JpexInstance, names?: any): any => {
  names = ensureArray(names);

  for (const key in jpex.$$factories) {
    if (!hasLength(names) || names.includes(key)) {
      jpex.$$factories[key].resolved = false;
    }
  }
  for (const key in jpex.$$resolved) {
    if (!hasLength(names) || names.includes(key)) {
      delete jpex.$$resolved[key];
    }
  }
};

export default clearCache;

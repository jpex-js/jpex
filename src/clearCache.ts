import { JpexInstance } from './types';
import { ensureArray, hasLength } from './utils';

export default function clearCache(this: JpexInstance, ...names: any[]): any {
  // eslint-disable-next-line no-param-reassign
  names = ensureArray(names);

  // eslint-disable-next-line no-restricted-syntax
  for (const key in this.$$factories) {
    if (!hasLength(names) || names.includes(key)) {
      this.$$factories[key].resolved = false;
    }
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const key in this.$$resolved) {
    if (!hasLength(names) || names.includes(key)) {
      delete this.$$resolved[key];
    }
  }
}

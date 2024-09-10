/* eslint-disable no-restricted-syntax */
// ^ this is disabled because we need to iterate over all prototype keys in the object
import { JpexInstance } from './types';
import { ensureArray, hasLength } from './utils';

export default function clearCache(this: JpexInstance, ..._names: any[]): any {
  const names = ensureArray(_names);

  for (const key in this.$$factories) {
    if (!hasLength(names) || names.includes(key)) {
      this.$$factories[key].resolved = false;
    }
  }

  for (const key in this.$$resolved) {
    if (!hasLength(names) || names.includes(key)) {
      delete this.$$resolved[key];
    }
  }
}

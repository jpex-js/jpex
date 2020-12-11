import { JpexInstance } from './types';
import { ensureArray, hasLength } from './utils';

export default function clearCache(this: JpexInstance, ...names: any[]): any {
  names = ensureArray(names);

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

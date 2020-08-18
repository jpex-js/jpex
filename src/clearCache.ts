import { JpexInstance } from './types';

const clearCache = (jpex: JpexInstance, names?: any): any => {
  names = [].concat(names || []);
  for (const key in jpex.$$factories) {
    if (!names.length || names.indexOf(key) > -1) {
      jpex.$$factories[key].resolved = false;
    }
  }
  for (const key in jpex.$$resolved) {
    if (!names.length || names.indexOf(key) > -1) {
      delete jpex.$$resolved[key];
    }
  }
};

export default clearCache;

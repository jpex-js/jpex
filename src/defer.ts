import { Dependency, JpexInstance } from './types';

export default function defer(this: JpexInstance, name: Dependency) {
  return this.encase([name], (fn) => fn);
}

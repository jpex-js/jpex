import {
  JpexInstance,
} from '../types';

export default function alias(
  this: JpexInstance,
  alias: any,
  name: any,
) {
  if (this.$$factories[name] != null) {
    this.$$factories[alias] = this.$$factories[name];
    return;
  }
  if (this.$$factories[alias] != null) {
    this.$$factories[name] = this.$$factories[alias];
    return;
  }
  throw new Error(`Cannot create an alias for [${name}|${alias}] as it does not exist`);
}

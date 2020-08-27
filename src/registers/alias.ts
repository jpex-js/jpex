import {
  JpexInstance,
} from '../types';

function alias(
  jpex: JpexInstance,
  alias: any,
  name: any,
) {
  if (jpex.$$factories[name] != null) {
    jpex.$$factories[alias] = jpex.$$factories[name];
    return;
  }
  if (jpex.$$factories[alias] != null) {
    jpex.$$factories[name] = jpex.$$factories[alias];
    return;
  }
  throw new Error(`Cannot create an alias for [${name}|${alias}] as it does not exist`);
}

export default alias;

import {
  JpexInstance,
} from '../types';
import { isValidFactory } from '../resolver/utils';

function alias(
  jpex: JpexInstance,
  alias: any,
  name: any,
) {
  if (isValidFactory(jpex.$$factories[name])) {
    jpex.$$factories[alias] = jpex.$$factories[name];
  } else if (isValidFactory(jpex.$$factories[alias])) {
    jpex.$$factories[name] = jpex.$$factories[alias];
  } else {
    throw new Error(`Cannot create an alias for [${name}|${alias}] as it does not exist`);
  }
}

export default alias;

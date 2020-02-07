import {
  JpexInstance,
} from '../types';
import { isValidFactory } from '../resolver/utils';

function alias(
  jpex: JpexInstance,
  alias: any,
  name: any,
) {
  const factory = jpex.$$factories[name];
  if (!isValidFactory(factory)) {
    throw new Error(`Cannot create an alias for [${name}] as it does not exist`);
  }

  jpex.$$factories[alias] = factory;
}

export default alias;

import Jpex from './Jpex';
import { resolve as registerResolveFactory } from './built-ins';
import type {
  JpexInstance,
  SetupConfig,
  NamedParameters,
  Resolve,
  Lifecycle,
  Precedence,
} from './types';

const jpex = new Jpex() as JpexInstance;

registerResolveFactory(jpex);

export {
  jpex,
};

export type {
  Lifecycle,
  JpexInstance,
  SetupConfig,
  NamedParameters,
  Resolve,
  Precedence,
};

export default jpex;

import Jpex from './Jpex';
import { resolve as registerResolveFactory } from './built-ins';
import type {
  JpexInstance,
  SetupConfig,
  Options,
  NamedParameters,
  Resolve,
  Lifecycle,
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
  Options,
  NamedParameters,
  Resolve,
};

export default jpex;

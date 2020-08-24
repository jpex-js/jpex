import Jpex from './Jpex';
import type {
  JpexInstance,
  SetupConfig,
  NamedParameters,
  Lifecycle,
  Precedence,
} from './types';

const jpex = new Jpex() as JpexInstance;

export {
  jpex,
};

export type {
  Lifecycle,
  JpexInstance,
  SetupConfig,
  NamedParameters,
  Precedence,
};

export default jpex;

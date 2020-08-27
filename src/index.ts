import Jpex from './Jpex';
import type {
  JpexInstance,
  SetupConfig,
  NamedParameters,
  Lifecycle,
  Precedence,
  FactoryOpts,
  ResolveOpts,
  ServiceOpts,
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
  FactoryOpts,
  ServiceOpts,
  ResolveOpts,
};

export default jpex;

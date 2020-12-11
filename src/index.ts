// import Jpex from './Jpex';
import makeJpex from './makeJpex';
import type {
  JpexInstance,
  SetupConfig,
  NamedParameters,
  Lifecycle,
  Precedence,
  FactoryOpts,
  ResolveOpts,
  ServiceOpts,
  NodeModule,
  Global,
} from './types';

// const jpex = new Jpex() as JpexInstance;
const jpex = makeJpex();

export {
  jpex,
};

export type {
  Lifecycle,
  JpexInstance,
  JpexInstance as Jpex,
  SetupConfig,
  NamedParameters,
  Precedence,
  FactoryOpts,
  ServiceOpts,
  ResolveOpts,
  NodeModule,
  Global,
};

export default jpex;

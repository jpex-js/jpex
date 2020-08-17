import Jpex from './Jpex';
import { resolve as registerResolveFactory } from './factories';
import type {
  JpexInstance,
  SetupConfig,
  Options,
  NamedParameters,
  Resolve,
} from './types';
import {
  Lifecycle,
} from './constants';

const jpex = new Jpex() as JpexInstance;

registerResolveFactory(jpex);

export {
  jpex,
};

export type {
  JpexInstance,
  SetupConfig,
  Lifecycle,
  Options,
  NamedParameters,
  Resolve,
};

export default jpex;

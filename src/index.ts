import Jpex from './Jpex';
import { resolve as registerResolveFactory } from './built-ins';
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
  Lifecycle,
};

export type {
  JpexInstance,
  SetupConfig,
  Options,
  NamedParameters,
  Resolve,
};

export default jpex;

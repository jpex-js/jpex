import Jpex from './Jpex';
import { resolve as registerResolveFactory } from './factories';
import {
  JpexInstance,
  SetupConfig,
} from './types';
import {
  Lifecycle,
} from './constants';

const jpex = new Jpex() as JpexInstance;

registerResolveFactory(jpex);

export {
  jpex,
  JpexInstance,
  SetupConfig,
  Lifecycle,
};

export default jpex;

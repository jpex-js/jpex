import Jpex from './Jpex';
import { resolve } from './factories';
import {
  JpexInstance,
  SetupConfig,
} from './types';
import {
  Lifecycle,
} from './constants';

const jpex = new Jpex() as JpexInstance;

resolve(jpex);

export {
  jpex,
  JpexInstance,
  SetupConfig,
  Lifecycle,
};

export default jpex;

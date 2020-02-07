import {
  JpexInstance,
  Definition,
  Dependency,
} from '../types';
import {
  resolveMany,
  resolveOne,
} from './resolve';

export const resolve = (
  jpex: JpexInstance,
  name: Dependency,
  namedParameters?: { [key: string]: any },
) => resolveOne(
  jpex,
  name,
  null,
  namedParameters,
  [],
);

export const resolveDependencies = (
  jpex: JpexInstance,
  definition: Definition,
  namedParameters?: { [key: string]: any },
) => {
  return resolveMany(
    jpex,
    definition,
    namedParameters,
    void 0,
    [],
  );
};

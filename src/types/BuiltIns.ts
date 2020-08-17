// Types for build in dependencies
import { Dependency } from './';

export interface NamedParameters {
  [key: string]: any,
}

export type Resolve = <T = any>(
  name: Dependency | Dependency[],
  namedParametres?: NamedParameters,
) => T;

export type Options<T = any> = T;

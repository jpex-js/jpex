// Types for build in dependencies
import { Dependency } from './';
import { ResolveOpts } from './JpexInstance';

export interface NamedParameters {
  [key: string]: any,
}

export type Resolve = <T = any>(
  name: Dependency | Dependency[],
  opts?: ResolveOpts,
) => T;

export type Options<T = any> = T;

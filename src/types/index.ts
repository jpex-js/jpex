import { Lifecycle } from '../constants';
export * from './JpexInstance';
export * from './BuiltIns';

export type AnyFunction<R = any> = (...args: any[]) => R;
export interface AnyConstructor<T = any> {
  new (...args: any[]): T
}

export interface SetupConfig {
  lifecycle?: Lifecycle,
  inherit?: boolean,
}

export type Dependency = string | { [key: string]: any };

export interface Definition {
  dependencies?: Dependency[],
}

export interface Factory extends Definition {
  fn: <T, R>(...args: T[]) => R,
  resolved?: boolean,
  value?: any,
  lifecycle?: Lifecycle,
}

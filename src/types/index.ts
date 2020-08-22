export * from './JpexInstance';
export * from './BuiltIns';

export type Lifecycle = 'application' | 'class' | 'instance' | 'none';

export type AnyFunction<R = any> = (...args: any[]) => R;
export interface AnyConstructor<T = any> {
  new (...args: any[]): T
}

export interface SetupConfig {
  inherit?: boolean,
  lifecycle?: Lifecycle,
  optional?: boolean,
  nodeModules?: boolean,
  globals?: boolean,
}

export type Dependency = string | { [key: string]: any };

export interface Definition {
  dependencies?: Dependency[],
}

export interface Factory extends Definition {
  fn: AnyFunction,
  lifecycle: Lifecycle,
  resolved?: boolean,
  value?: any,
}

export type Lifecycle = 'application' | 'class' | 'instance' | 'none';

export type Precedence = 'active' | 'passive';

export type AnyFunction<R = any> = (...args: any[]) => R;
export interface AnyConstructor<T = any> {
  new (...args: any[]): T;
}

export type Dependency = string;

export interface Definition {
  dependencies?: Dependency[];
}

export interface Factory extends Definition {
  fn: AnyFunction;
  lifecycle: Lifecycle;
  resolved?: boolean;
  value?: any;
}

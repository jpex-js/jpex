import {
  Lifecycle,
  AnyFunction,
  Dependency,
  AnyConstructor,
  SetupConfig,
  Factory,
} from './';
import { NamedParameters } from './BuiltIns';

export interface FactoryOpts {
  lifecycle?: Lifecycle,
}
export interface ServiceOpts extends FactoryOpts {
  bindToInstance?: boolean,
}
export interface ResolveOpts {
  optional?: boolean,
  with?: NamedParameters,
}

export interface JpexInstance {
  constant(name: string, obj: any): void
  constant<T>(obj: T): void

  factory(name: string, deps: Dependency[], fn: AnyFunction, opts?: FactoryOpts): void
  factory<T>(fn: AnyFunction<T>, opts?: FactoryOpts): void

  // eslint-disable-next-line max-len
  service(name: string, deps: Dependency[], fn: AnyConstructor | AnyFunction, opts?: ServiceOpts): void
  service<T>(fn: AnyConstructor<T> | AnyFunction, opts?: ServiceOpts): void

  alias(alias: string, name: string): void,
  alias<T>(alias: string): void,

  resolve(name: Dependency, opts?: ResolveOpts): any,
  resolve<T>(opts?: ResolveOpts): T,

  resolveWith(name: Dependency, namedParameters: NamedParameters): any
  resolveWith<T>(namedParameters: NamedParameters): T,

  encase<F extends AnyFunction<AnyFunction>>(
    dependencies: Dependency[],
    fn: F,
  ): ReturnType<F> & { encased: F },
  encase<F extends AnyFunction<AnyFunction>>(
    fn: F,
  ): ReturnType<F> & { encased : F },

  raw(name: Dependency): AnyFunction,
  raw<T>(): AnyFunction<T>,

  clearCache<T = any>(): void,
  clearCache(...names: string[]): void,

  extend(config?: SetupConfig): JpexInstance,

  infer<T>(): string,

  $$parent: JpexInstance,
  $$factories: {
    [key: string]: Factory,
  },
  $$resolved: {
    [key: string]: any,
  },
  $$config: {
    lifecycle: Lifecycle,
    optional: boolean,
    nodeModules: boolean,
    globals: boolean,
  },
}

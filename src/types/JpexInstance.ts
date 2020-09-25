/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Lifecycle,
  AnyFunction,
  Dependency,
  AnyConstructor,
  Factory,
  Precedence,
  NamedParameters,
} from './';

export interface SetupConfig {
  inherit?: boolean,
  lifecycle?: Lifecycle,
  precedence?: Precedence,
  optional?: boolean,
  nodeModules?: boolean,
  globals?: boolean,
}

export interface FactoryOpts {
  lifecycle?: Lifecycle,
  precedence?: Precedence,
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
  // we need to include these mixed variants so that typescript doesn't get mad after we do our transformation
  constant<T>(name: string, obj: T): void

  factory(name: string, deps: Dependency[], fn: AnyFunction, opts?: FactoryOpts): void
  factory<T>(fn: AnyFunction<T>, opts?: FactoryOpts): void
  factory<T>(name: string, deps: Dependency[], fn: AnyFunction<T>, opts?: FactoryOpts): void

  // eslint-disable-next-line max-len
  service(name: string, deps: Dependency[], fn: AnyConstructor | AnyFunction, opts?: ServiceOpts): void
  service<T>(fn: AnyConstructor<T> | AnyFunction, opts?: ServiceOpts): void
  // eslint-disable-next-line max-len
  service<T>(name: string, deps: Dependency[], fn: AnyConstructor<T> | AnyFunction, opts?: ServiceOpts): void

  alias(alias: string, name: string): void,
  alias<T>(alias: string): void,
  alias<T, U>(): void,
  alias<T>(alias: string, name: string): void,
  alias<T, U>(alias: string, name: string): void,

  resolve(name: Dependency, opts?: ResolveOpts): any,
  resolve<T>(opts?: ResolveOpts): T,
  resolve<T>(name: Dependency, opts?: ResolveOpts): T,

  resolveWith(name: Dependency, namedParameters: NamedParameters, opts?: ResolveOpts): any
  resolveWith<T>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C, D>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C, D, E>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C, D, E, F>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C, D>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C, D, E>(namedParameters: NamedParameters, opts?: ResolveOpts): T,
  resolveWith<T, A, B, C, D, E, F>(namedParameters: NamedParameters, opts?: ResolveOpts): T,

  encase<F extends AnyFunction<AnyFunction>>(
    dependencies: Dependency[],
    fn: F,
  ): ReturnType<F> & { encased: F },
  encase<F extends AnyFunction<AnyFunction>>(
    fn: F,
  ): ReturnType<F> & { encased : F },

  raw(name: Dependency): AnyFunction,
  raw<T>(): AnyFunction<T>,
  raw<T>(name: Dependency): AnyFunction<T>,

  clearCache<T = any>(): void,
  clearCache(...names: string[]): void,
  clearCache<T = any>(...names: string[]): void,

  extend(config?: SetupConfig): JpexInstance,

  infer<T>(): string,

  $$parent: JpexInstance,
  $$factories: {
    [key: string]: Factory,
  },
  $$resolved: {
    [key: string]: Factory,
  },
  $$config: {
    lifecycle: Lifecycle,
    precedence: Precedence,
    optional: boolean,
    nodeModules: boolean,
    globals: boolean,
  },
}

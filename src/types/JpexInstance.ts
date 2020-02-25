import { Lifecycle } from '../constants';
import { Wrapper } from '../deps/wrapper';
import {
  AnyFunction,
  Dependency,
  AnyConstructor,
  SetupConfig,
  Factory,
} from './';

export interface JpexInstance {
  constant<T = any>(name: string, obj: T): Wrapper
  constant<T>(obj: T): Wrapper

  factory<T = any>(name: string, fn: AnyFunction<T>): Wrapper
  factory<T = any>(name: string, deps: Dependency[], fn: AnyFunction<T>): Wrapper

  factory<T>(fn: AnyFunction<T>): Wrapper
  factory<T>(deps: Dependency[], fn: AnyFunction<T>): Wrapper

  service<T = any>(name: string, fn: AnyConstructor<T> | AnyFunction): Wrapper
  service<T = any>(name: string, deps: Dependency[], fn: AnyConstructor | AnyFunction): Wrapper

  service<T>(fn: AnyConstructor<T> | AnyFunction): Wrapper

  alias<T = any>(alias: string, name: string): void,
  alias<T>(alias: string): void,

  resolve<T = any>(name: Dependency): T,
  resolve<T>(): T,

  resolveWith<T = any>(
    name: Dependency,
    namedParameters: {
      [key: string]: any,
    },
  ): T
  resolveWith<T>(
    namedParameters: {
      [key: string]: any,
    },
  ): T,

  encase<T, F extends AnyFunction<T>>(
    fn: AnyFunction<F>,
  ): F & { encased: AnyFunction<F> },
  encase<T, F extends AnyFunction<T>>(
    dependencies: Dependency[],
    fn: AnyFunction<F>,
  ): F & { encased: AnyFunction<F> },

  clearCache(): void,
  clearCache(name: string): void,
  clearCache(names: string[]): void,

  extend(): JpexInstance,
  extend(config: SetupConfig): JpexInstance,

  infer<T>(): string,

  $$parent: JpexInstance,
  $$defaultLifecycle: Lifecycle,
  $$factories: {
    [key: string]: Factory,
  },
  $$resolved: {
    [key: string]: any,
  },
}

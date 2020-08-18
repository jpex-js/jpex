import { Lifecycle } from '../constants';
import { Wrapper } from '../registers/wrapper';
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

  encase<F extends AnyFunction<AnyFunction>>(
    fn: F,
  ): ReturnType<F> & { encased : F },
  encase<F extends AnyFunction<AnyFunction>>(
    dependencies: Dependency[],
    fn: F,
  ): ReturnType<F> & { encased: F },

  raw<T = any>(name: Dependency): AnyFunction<T>,
  raw<T>(): AnyFunction<T>,

  clearCache<T = any>(): void,
  clearCache(name: string): void,
  clearCache(names: string[]): void,

  extend(): JpexInstance,
  extend(config: SetupConfig): JpexInstance,

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

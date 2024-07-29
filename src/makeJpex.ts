import { JpexInstance as IJpex, SetupConfig } from './types';
import { constant, factory, service, alias, factoryAsync } from './registers';
import { resolve, getFactory, resolveAsync } from './resolver';
import encase from './encase';
import clearCache from './clearCache';

const defaultConfig = {
  lifecycle: 'class' as const,
  precedence: 'active' as const,
  globals: true,
  nodeModules: true,
  optional: false,
};

export default function makeJpex(
  { inherit = true, ...config }: SetupConfig = {},
  parent?: IJpex,
) {
  const jpex = {
    $$parent: parent,
    $$config: {
      ...defaultConfig,
      ...(inherit ? parent?.$$config : {}),
      ...config,
    },
    $$factories: parent && inherit ? Object.create(parent.$$factories) : {},
    $$resolved: {},
    $$alias: parent && inherit ? Object.create(parent.$$alias) : {},
    constant,
    factory,
    factoryAsync,
    service,
    alias,
    resolve,
    resolveAsync,
    encase,
    clearCache,
    extend(config?: SetupConfig): IJpex {
      return makeJpex(config, this);
    },
    resolveWith(name: any, namedParameters?: any, opts?: any): any {
      return this.resolve(name, {
        with: namedParameters,
        ...opts,
      });
    },
    resolveAsyncWith(name: any, namedParameters?: any, opts?: any): any {
      return this.resolveAsync(name, {
        with: namedParameters,
        ...opts,
      });
    },
    raw(name?: any): any {
      return getFactory(this, name, {}).fn;
    },
    infer: () => '',
  };

  return jpex as IJpex;
}

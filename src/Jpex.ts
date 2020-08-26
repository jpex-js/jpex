import {
  JpexInstance as IJpex,
  AnyFunction,
  Factory,
  SetupConfig,
} from './types';
import {
  constant,
  factory,
  service,
  alias as createAlias,
} from './registers';
import {
  resolve,
  getFactory,
} from './resolver';
import encase from './encase';
import clearCache from './clearCache';

const defaultConfig = {
  lifecycle: 'class' as const,
  precedence: 'active' as const,
  globals: true,
  nodeModules: true,
  optional: false,
};

class Jpex implements IJpex {
  decorate: any;
  $$config: IJpex['$$config'];
  $$parent: IJpex;
  $$factories: {
    [key: string]: Factory,
  } = {};
  $$resolved: {
    [key: string]: any,
  } = {};

  constructor(options: SetupConfig = {}, parent?: IJpex) {
    const {
      inherit = true,
      ...config
    } = options;

    this.$$parent = parent;
    this.$$config = {
      ...defaultConfig,
      ...(inherit ? parent?.$$config : {}),
      ...config,
    };

    if (parent && inherit) {
      this.$$factories = Object.create(parent.$$factories);
    }
  }

  extend(config?: SetupConfig): IJpex {
    return new Jpex(config, this);
  }

  constant(name: string, obj?: any) {
    return constant(this, name, obj);
  }
  factory(name: any, deps?: any, fn?: any, opts?: any): any {
    return factory(this, name, deps, fn, opts);
  }
  service(name: any, deps?: any, fn?: any, opts?: any): any {
    return service(this, name, deps, fn, opts);
  }
  alias(alias?: any, name?: any): any {
    return createAlias(this, alias, name);
  }
  resolve(name?: any, opts?: any): any {
    return resolve(this, name, opts);
  }
  resolveWith(name: any, namedParameters?: any, opts?: any): any {
    return resolve(this, name, {
      with: namedParameters,
      ...opts,
    });
  }

  raw(name?: any): any {
    return getFactory(this, name, {}).fn;
  }

  encase<F extends AnyFunction, G extends AnyFunction<F>>(deps: any, fn?: any): any {
    return encase(this, deps, fn);
  }

  clearCache(...names: any[]): any {
    return clearCache(this, names);
  }

  infer() {
    return '';
  }
}

export default Jpex;

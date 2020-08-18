import {
  JpexInstance as IJpex,
  AnyFunction,
  Factory,
  SetupConfig,
} from './types';
import {
  Lifecycle,
} from './constants';
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
      lifecycle: inherit ? parent?.$$config.lifecycle : void 0 ?? Lifecycle.CLASS,
      globals: true,
      nodeModules: true,
      optional: false,
      ...config,
    };

    if (parent && inherit) {
      this.$$factories = Object.create(parent.$$factories);
    }
  }

  extend(config?: SetupConfig): IJpex {
    return new Jpex(config, this);
  }

  constant(name: any, obj?: any): any {
    return constant(this, name, obj);
  }
  factory(name: any, deps?: any, fn?: any): any {
    return factory(this, name, deps, fn);
  }
  service(name: any, deps?: any, fn?: any): any {
    return service(this, name, deps, fn);
  }
  alias(alias?: any, name?: any): any {
    return createAlias(this, alias, name);
  }
  resolve(name?: any): any {
    return resolve(this, name);
  }
  resolveWith(name: any, namedParameters?: any): any {
    return resolve(this, name, namedParameters);
  }

  raw(name?: any): any {
    return getFactory(this, name, false).fn;
  }

  encase<F extends AnyFunction, G extends AnyFunction<F>>(deps: any, fn?: any): any {
    return encase(this, deps, fn);
  }

  clearCache(names?: any): any {
    return clearCache(this, names);
  }

  infer() {
    return '';
  }
}

export default Jpex;

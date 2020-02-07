import {
  JpexInstance as IJpex,
  AnyFunction,
  Dependency,
  Factory,
  SetupConfig,
} from './types';
import {
  Lifecycle,
} from './constants';
import {
  constant,
  decorator,
  factory,
  service,
  alias as createAlias,
} from './deps';
import {
  resolve,
  resolveDependencies,
} from './resolver';
import {
  extractParameters,
} from './utils';

class Jpex implements IJpex {
  decorate: any;
  $$defaultLifecycle: Lifecycle;
  $$parent: IJpex;
  $$factories: {
    [key: string]: Factory,
  } = {};
  $$resolved: {
    [key: string]: any,
  } = {};

  constructor({
    lifecycle = Lifecycle.CLASS,
  }: SetupConfig = {}, parent?: IJpex) {
    this.$$parent = parent;
    this.$$defaultLifecycle = lifecycle;

    if (parent) {
      this.$$factories = Object.create(parent.$$factories);
    }
  }

  extend(config?: SetupConfig): IJpex {
    config = {
      lifecycle: this.$$defaultLifecycle,
      ...config,
    };

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
  decorator(name: any, fn?: any): any {
    return decorator(this, name, fn);
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

  encase<F extends AnyFunction, G extends AnyFunction<F>>(_deps: any, _fn?: any): any {
    const [ dependencies, fn ] = ((): [ Dependency[], G ] => {
      if (typeof _deps === 'function') {
        return [ extractParameters(_deps), _deps ];
      }
      return [ _deps, _fn ];
    })();
    const jpex = this;

    const encased = function(...args: Parameters<F>) {
      const deps = resolveDependencies(jpex, { dependencies });

      // eslint-disable-next-line no-invalid-this
      return fn.apply(this, deps).apply(this, args);
    };
    encased.encased = fn;

    return encased;
  }

  clearCache(names?: any): any {
    names = [].concat(names || []);
    for (const key in this.$$factories) {
      if (!names.length || names.indexOf(key) > -1) {
        this.$$factories[key].resolved = false;
      }
    }
    for (const key in this.$$resolved) {
      if (!names.length || names.indexOf(key) > -1) {
        delete this.$$resolved[key];
      }
    }
  }

  infer() {
    return '';
  }
}

export default Jpex;

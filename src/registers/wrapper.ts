import { Lifecycle } from '../constants';
import { Factory, Dependency } from '../types';

const wrapper = (factory: Factory) => {
  const wrapper = {
    lifecycle: {
      application: () => {
        factory.lifecycle = Lifecycle.APPLICATION;
        return wrapper;
      },
      class: () => {
        factory.lifecycle = Lifecycle.CLASS;
        return wrapper;
      },
      instance: () => {
        factory.lifecycle = Lifecycle.INSTANCE;
        return wrapper;
      },
      none: () => {
        factory.lifecycle = Lifecycle.NONE;
        return wrapper;
      },
    },
    bindToInstance: () => {
      if (factory.fn) {
        // @ts-ignore
        factory.fn.bindToInstance = true;
      }
      return wrapper;
    },
    dependencies: (...deps: Dependency[]) => {
      factory.dependencies = deps;
      return wrapper;
    },
  };

  return wrapper;
};

export default wrapper;

export type Wrapper = ReturnType<typeof wrapper>;

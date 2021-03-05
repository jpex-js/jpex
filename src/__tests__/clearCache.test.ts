import { jpex } from '..';

type Instance = Record<string, any>;
const instance = jpex.infer<Instance>();

const setup = () => ({
  jpex: jpex.extend(),
});

it('sets a factory to resolved once resolved', () => {
  const { jpex } = setup();

  jpex.factory<Instance>(() => ({}), { lifecycle: 'application' });
  expect(jpex.$$factories[instance].resolved).toBe(void 0);

  jpex.resolve<Instance>();
  expect(jpex.$$factories[instance].resolved).toBe(true);
});

it('clears the cache', () => {
  const { jpex } = setup();

  jpex.factory<Instance>(() => ({}), { lifecycle: 'application' });

  expect(jpex.$$factories[instance].resolved).toBe(void 0);
  jpex.resolve<Instance>();

  expect(jpex.$$factories[instance].resolved).toBe(true);

  jpex.clearCache();
  expect(jpex.$$factories[instance].resolved).toBe(false);
});

it('returns a new instance once the cache is cleared', () => {
  const { jpex } = setup();
  jpex.factory<Instance>(() => ({}), { lifecycle: 'application' });

  const a = jpex.resolve<Instance>();
  const b = jpex.resolve<Instance>();
  jpex.clearCache();
  const c = jpex.resolve<Instance>();

  expect(a).toBe(b);
  expect(a).not.toBe(c);
});

it('clears specific factories', () => {
  const { jpex } = setup();
  type A = string;
  type B = string;
  jpex.factory<A>(() => 'a', { lifecycle: 'application' });
  jpex.factory<B>(() => 'b', { lifecycle: 'application' });
  jpex.resolve<A>();
  jpex.resolve<B>();

  expect(jpex.$$factories[jpex.infer<A>()].resolved).toBe(true);
  expect(jpex.$$factories[jpex.infer<B>()].resolved).toBe(true);

  jpex.clearCache<A>();

  expect(jpex.$$factories[jpex.infer<A>()].resolved).not.toBe(true);
  expect(jpex.$$factories[jpex.infer<B>()].resolved).toBe(true);
});

it('should clear Class-based caches', () => {
  const { jpex } = setup();
  type A = any;
  type B = any;
  jpex.factory<A>(() => ({}), { lifecycle: 'class' });
  jpex.factory<B>(() => ({}), { lifecycle: 'class' });
  jpex.resolve<A>();
  jpex.resolve<B>();

  expect(typeof jpex.$$resolved[jpex.infer<A>()]).toBe('object');

  jpex.clearCache();

  expect(jpex.$$resolved[jpex.infer<A>()]).toBe(void 0);
});

it('skips unregistered dependencies', () => {
  const { jpex } = setup();
  type A = any;

  expect(() => jpex.clearCache<A>()).not.toThrow();
});

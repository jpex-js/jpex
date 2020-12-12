import anyTest, { TestInterface } from 'ava';
import { jpex, JpexInstance } from '..';

interface Instance {}
const instance = jpex.infer<Instance>();

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  t.context = {
    jpex: jpex.extend(),
  };
});

test('sets a factory to resolved once resolved', t => {
  const { jpex } = t.context;

  jpex.factory<Instance>(() => ({}), { lifecycle: 'application' });
  t.is(jpex.$$factories[instance].resolved, void 0);

  jpex.resolve<Instance>();
  t.is(jpex.$$factories[instance].resolved, true);
});

test('clears the cache', t => {
  const { jpex } = t.context;

  jpex.factory<Instance>(() => ({}), { lifecycle: 'application' });

  t.is(jpex.$$factories[instance].resolved, void 0);
  jpex.resolve<Instance>();

  t.is(jpex.$$factories[instance].resolved, true);

  jpex.clearCache();
  t.is(jpex.$$factories[instance].resolved, false);
});

test('returns a new instance once the cache is cleared', t => {
  jpex.factory<Instance>(() => ({}), { lifecycle: 'application' });

  const a = jpex.resolve<Instance>();
  const b = jpex.resolve<Instance>();
  jpex.clearCache();
  const c = jpex.resolve<Instance>();

  t.is(a, b);
  t.not(a, c);
});

test('clears specific factories', t => {
  type A = string;
  type B = string;
  jpex.factory<A>(() => 'a', { lifecycle: 'application' });
  jpex.factory<B>(() => 'b', { lifecycle: 'application' });
  jpex.resolve<A>();
  jpex.resolve<B>();

  t.true(jpex.$$factories[jpex.infer<A>()].resolved);
  t.true(jpex.$$factories[jpex.infer<B>()].resolved);

  jpex.clearCache<A>();

  t.false(jpex.$$factories[jpex.infer<A>()].resolved);
  t.true(jpex.$$factories[jpex.infer<B>()].resolved);
});

test('should clear Class-based caches', t => {
  type A = any;
  type B = any;
  jpex.factory<A>(() => ({}), { lifecycle: 'class' });
  jpex.factory<B>(() => ({}), { lifecycle: 'class' });
  jpex.resolve<A>();
  jpex.resolve<B>();

  t.is(typeof jpex.$$resolved[jpex.infer<A>()], 'object');

  jpex.clearCache();

  t.is(jpex.$$resolved[jpex.infer<A>()], void 0);
});

test('skips unregistered dependencies', t => {
  type A = any;

  t.notThrows(() => jpex.clearCache<A>());
});

import anyTest, { TestInterface } from 'ava';
import { jpex, JpexInstance } from '../..';

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

  jpex.factory('instance', [], () => ({}), { lifecycle: 'application' });
  t.is(jpex.$$factories.instance.resolved, void 0);

  jpex.resolve('instance');
  t.is(jpex.$$factories.instance.resolved, true);
});

test('clears the cache', t => {
  const { jpex } = t.context;

  jpex.factory('instance', [], () => ({}), { lifecycle: 'application' });

  t.is(jpex.$$factories.instance.resolved, void 0);
  jpex.resolve('instance');

  t.is(jpex.$$factories.instance.resolved, true);

  jpex.clearCache();
  t.is(jpex.$$factories.instance.resolved, false);
});

test('returns a new instance once the cache is cleared', t => {
  jpex.factory('instance', [], () => ({}), { lifecycle: 'application' });

  const a = jpex.resolve('instance');
  const b = jpex.resolve('instance');
  jpex.clearCache();
  const c = jpex.resolve('instance');

  t.is(a, b);
  t.not(a, c);
});

test('clears specific factories', t => {
  jpex.factory('a', [], () => ({}), { lifecycle: 'application' });
  jpex.factory('b', [], () => ({}), { lifecycle: 'application' });
  jpex.factory('c', [], () => ({}), { lifecycle: 'application' });
  jpex.resolve('a');
  jpex.resolve('b');
  jpex.resolve('c');

  t.true(jpex.$$factories.a.resolved);
  t.true(jpex.$$factories.b.resolved);
  t.true(jpex.$$factories.c.resolved);

  jpex.clearCache('a', 'b');

  t.false(jpex.$$factories.a.resolved);
  t.false(jpex.$$factories.b.resolved);
  t.true(jpex.$$factories.c.resolved);
});

test('should clear Class-based caches', t => {
  jpex.factory('a', [], () => ({}), { lifecycle: 'class' });
  jpex.resolve('a');

  t.is(typeof jpex.$$resolved.a, 'object');

  jpex.clearCache();

  t.is(jpex.$$resolved.a, void 0);
});

test('skips unregistered dependencies', t => {
  t.notThrows(() => jpex.clearCache('a'));
});

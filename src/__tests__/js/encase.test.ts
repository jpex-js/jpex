import anyTest, { TestInterface } from 'ava';
import { stub } from 'sinon';
import jpex, { JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  t.context = {
    jpex: jpex.extend(),
  };
});

test('wraps a method with specified dependencies', t => {
  const { jpex } = t.context;

  const fn = jpex.encase([ 'foo' ], (foo: string) => (bah: string) => (foo + bah));

  jpex.constant('foo', 'injected');

  const result = fn('provided');

  t.is(result, 'injectedprovided');
});

test('exposes the inner function', t => {
  const { jpex } = t.context;

  const fn = jpex.encase([ 'foo' ], foo => (bah: string) => (foo + bah));
  const fn2 = fn.encased;

  const result = fn2('injected')('provided');

  t.is(result, 'injectedprovided');
});

test('caches the inner function', t => {
  const { jpex } = t.context;

  jpex.constant('foo', 'injected');

  const inner = stub().callsFake(foo => {
    return (bah: string) => {
      return foo + bah;
    };
  });
  const fn = jpex.encase([ 'foo' ], inner);

  fn('provided');
  t.is(inner.callCount, 1);

  fn('xxx');
  t.is(inner.callCount, 1);

  jpex.clearCache();

  fn('yyy');
  t.is(inner.callCount, 2);
});

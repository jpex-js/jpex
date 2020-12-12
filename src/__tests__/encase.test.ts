import anyTest, { TestInterface } from 'ava';
import { stub } from 'sinon';
import jpex, { JpexInstance } from '..';

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

  type Foo = string;
  const fn = jpex.encase((foo: Foo) => (bah: string) => (foo + bah));

  jpex.constant<Foo>('injected');

  const result = fn('provided');

  t.is(result, 'injectedprovided');
});

test('works with global interfaces', t => {
  const { jpex } = t.context;

  jpex.constant<Window>(window);

  const fn = jpex.encase((window: Window) => () => window);

  const result = fn();

  t.is(result, window);
});

test('exposes the inner function', t => {
  const { jpex } = t.context;
  type Foo = string;

  const fn = jpex.encase((foo: Foo) => (bah: string) => (foo + bah));
  const fn2 = fn.encased;

  const result = fn2('injected')('provided');

  t.is(result, 'injectedprovided');
});

test('caches the inner function', t => {
  const { jpex } = t.context;
  type Foo = string;

  jpex.constant<Foo>('injected');

  const spy = stub().callsFake(foo => {
    return (bah: string) => {
      return foo + bah;
    };
  });
  const inner = (foo: Foo) => spy(foo);
  const fn = jpex.encase(inner);

  fn('provided');
  t.is(spy.callCount, 1);

  fn('xxx');
  t.is(spy.callCount, 1);

  jpex.clearCache();

  fn('yyy');
  t.is(spy.callCount, 2);
});

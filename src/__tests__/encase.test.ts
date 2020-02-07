import anyTest, { TestInterface } from 'ava';
import jpex, { JpexInstance } from '..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach((t) => {
  t.context = {
    jpex: jpex.extend(),
  };
});

test('wraps a method with specified dependencies', (t) => {
  const { jpex } = t.context;

  const fn = jpex.encase([ 'foo' ], (foo: string) => (bah: string) => (foo + bah));

  jpex.constant('foo', 'injected');

  const result = fn('provided');

  t.is(result, 'injectedprovided');
});

test('infers dependencies from function arguments', (t) => {
  const { jpex } = t.context;

  type Foo = string;
  const fn = jpex.encase((foo: Foo) => (bah: string) => (foo + bah));

  jpex.constant<Foo>('injected');

  const result = fn('provided');

  t.is(result, 'injectedprovided');
});

test('exposes the inner function', (t) => {
  const { jpex } = t.context;
  type Foo = string;

  const fn = jpex.encase((foo: Foo) => (bah: string) => (foo + bah));
  const fn2 = fn.encased;

  const result = fn2('injected')('provided');

  t.is(result, 'injectedprovided');
});

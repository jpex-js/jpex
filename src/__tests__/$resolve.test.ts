import anyTest, { TestInterface } from 'ava';
import { jpex as base, JpexInstance } from '..';

const test: TestInterface<{
  jpex: JpexInstance,
  resolve: (name: any, named?: any) => any,
}> = anyTest;

test.beforeEach((t) => {
  const jpex = base.extend();
  const resolve = jpex.resolve('$resolve');

  t.context = {
    jpex,
    resolve,
  };
});

test('resolves a dependency', (t) => {
  const { resolve } = t.context;
  const path = resolve('path');

  t.truthy(path);
});

test('resolves a dependency on the current instance', (t) => {
  const { jpex, resolve } = t.context;
  jpex.constant('FOO', 'bah');
  const foo = resolve('FOO');

  t.is(foo, 'bah');
});

test('can resolve itself', (t) => {
  const { resolve } = t.context;
  const r = resolve('$resolve');

  t.is(resolve, r);
});

test('errors if dependency cannot be resolved', (t) => {
  t.throws(() => t.context.resolve('blurgh'));
});

test('accepts named parameters', (t) => {
  const { resolve } = t.context;
  const test = resolve('foo', { with: { foo: 'bah' } });

  t.is(test, 'bah');
});

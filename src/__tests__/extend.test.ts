import anyTest, { TestInterface } from 'ava';
import { jpex, JpexInstance } from '..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach((t) => {
  t.context = {
    jpex: jpex.extend(),
  };

  t.context.jpex.constant('FOO', 'foo');
});

test('returns a new jpex instance', (t) => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend({});

  t.is(typeof jpex2, 'object');
  t.is(typeof jpex.resolve, 'function');
});

test('inherits dependencies', (t) => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend();
  const value = jpex2.resolve('FOO');

  t.is(value, 'foo');
});

test('overrides inherited dependencies', (t) => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend();
  jpex2.constant('FOO', 'bah');
  const value = jpex2.resolve('FOO');

  t.is(value, 'bah');
});

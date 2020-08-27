import anyTest, { TestInterface } from 'ava';
import { jpex, JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach((t) => {
  t.context = {
    jpex: jpex.extend(),
  };
});

test('it aliases a factory', (t) => {
  const { jpex } = t.context;

  jpex.factory('foo', [], () => 'foo');
  jpex.alias('foo', 'bah');

  const result = jpex.resolve('bah');

  t.is(result, 'foo');
});

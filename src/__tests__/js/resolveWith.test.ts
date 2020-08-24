import anyTest, { TestInterface } from 'ava';
import base, { JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach((t) => {
  const jpex = base.extend();

  t.context = {
    jpex,
  };
});

test('it resolves with given values', (t) => {
  const { jpex } = t.context;

  jpex.factory('A', [ 'B', 'C', 'D' ], (b, c, d) => {
    return b + c + d;
  });

  const result = jpex.resolveWith('A', {
    B: 'b',
    C: 'c',
    D: 'd',
  });

  t.is(result, 'bcd');
});

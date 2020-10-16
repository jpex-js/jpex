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

test('it returns the raw factory by name', (t) => {
  const { jpex } = t.context;
  type Constant = string;

  jpex.constant('constant', 'foo');
  jpex.factory('factory', [ 'constant' ], (v: Constant) => {
    return v
      .split('')
      .reverse()
      .join('');
  });

  const factory = jpex.raw('factory');
  const result = factory('bah');

  t.is(result, 'hab');
});


test('it throws when not found', (t) => {
  const { jpex } = t.context;

  t.throws(() => jpex.raw('not-found'));
});
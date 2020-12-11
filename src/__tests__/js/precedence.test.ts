import anyTest, { TestInterface } from 'ava';
import { jpex as base, JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
  jpex2: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const jpex = base.extend();
  const jpex2 = jpex.extend();

  t.context = {
    jpex,
    jpex2,
  };
});

test('active overwrites an existing factory', t => {
  const { jpex } = t.context;

  jpex.factory('a', [], () => 'a');
  jpex.factory('a', [], () => 'A', { precedence: 'active' });

  const result = jpex.resolve('a');

  t.is(result, 'A');
});

test('active overwrites an inherited factory', t => {
  const { jpex, jpex2 } = t.context;

  jpex.factory('a', [], () => 'a');
  jpex2.factory('a', [], () => 'A', { precedence: 'active' });

  const result = jpex2.resolve('a');

  t.is(result, 'A');
});

test('defaults to active', t => {
  const { jpex } = t.context;

  jpex.factory('a', [], () => 'a');
  jpex.factory('a', [], () => 'A');

  const result = jpex.resolve('a');

  t.is(result, 'A');
});

test('passive is ignored over an existing factory', t => {
  const { jpex } = t.context;

  jpex.factory('a', [], () => 'a');
  jpex.factory('a', [], () => 'A', { precedence: 'passive' });

  const result = jpex.resolve('a');

  t.is(result, 'a');
});

test('passive is ignored over an inherited factory', t => {
  const { jpex, jpex2 } = t.context;

  jpex.factory('a', [], () => 'a');
  jpex2.factory('a', [], () => 'A', { precedence: 'passive' });

  const result = jpex2.resolve('a');

  t.is(result, 'a');
});

test('passive is used if it does not exist', t => {
  const { jpex2 } = t.context;

  jpex2.factory('a', [], () => 'A', { precedence: 'passive' });

  const result = jpex2.resolve('a');

  t.is(result, 'A');
});

test('inherits passive from config', t => {
  const { jpex: base } = t.context;
  const jpex = base.extend({ precedence: 'passive' });
  jpex.factory('a', [], () => 'a');
  jpex.factory('a', [], () => 'A');

  const result = jpex.resolve('a');

  t.is(result, 'a');
});

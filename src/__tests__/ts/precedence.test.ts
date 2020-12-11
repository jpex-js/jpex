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

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A', { precedence: 'active' });

  const result = jpex.resolve<A>();

  t.is(result, 'A');
});

test('active overwrites an inherited factory', t => {
  const { jpex, jpex2 } = t.context;

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex2.factory<A>(() => 'A', { precedence: 'active' });

  const result = jpex2.resolve<A>();

  t.is(result, 'A');
});

test('defaults to active', t => {
  const { jpex } = t.context;

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A');

  const result = jpex.resolve<A>();

  t.is(result, 'A');
});

test('passive is ignored over an existing factory', t => {
  const { jpex } = t.context;

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A', { precedence: 'passive' });

  const result = jpex.resolve<A>();

  t.is(result, 'a');
});

test('passive is ignored over an inherited factory', t => {
  const { jpex, jpex2 } = t.context;

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex2.factory<A>(() => 'A', { precedence: 'passive' });

  const result = jpex2.resolve<A>();

  t.is(result, 'a');
});

test('passive is used if it does not exist', t => {
  const { jpex2 } = t.context;

  type A = string;
  jpex2.factory<A>(() => 'A', { precedence: 'passive' });

  const result = jpex2.resolve<A>();

  t.is(result, 'A');
});

test('inherits passive from config', t => {
  const { jpex: base } = t.context;
  const jpex = base.extend({ precedence: 'passive' });
  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A');

  const result = jpex.resolve<A>();

  t.is(result, 'a');
});

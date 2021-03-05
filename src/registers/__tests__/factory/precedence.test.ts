import { jpex as base } from '../../..';

const setup = () => {
  const jpex = base.extend();
  const jpex2 = jpex.extend();

  return {
    jpex,
    jpex2,
  };
};

test('active overwrites an existing factory', () => {
  const { jpex } = setup();

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A', { precedence: 'active' });

  const result = jpex.resolve<A>();

  expect(result).toBe('A');
});

test('active overwrites an inherited factory', () => {
  const { jpex, jpex2 } = setup();

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex2.factory<A>(() => 'A', { precedence: 'active' });

  const result = jpex2.resolve<A>();

  expect(result).toBe('A');
});

test('defaults to active', () => {
  const { jpex } = setup();

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A');

  const result = jpex.resolve<A>();

  expect(result).toBe('A');
});

test('passive is ignored over an existing factory', () => {
  const { jpex } = setup();

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A', { precedence: 'passive' });

  const result = jpex.resolve<A>();

  expect(result).toBe('a');
});

test('passive is ignored over an inherited factory', () => {
  const { jpex, jpex2 } = setup();

  type A = string;
  jpex.factory<A>(() => 'a');
  jpex2.factory<A>(() => 'A', { precedence: 'passive' });

  const result = jpex2.resolve<A>();

  expect(result).toBe('a');
});

test('passive is used if it does not exist', () => {
  const { jpex2 } = setup();

  type A = string;
  jpex2.factory<A>(() => 'A', { precedence: 'passive' });

  const result = jpex2.resolve<A>();

  expect(result).toBe('A');
});

test('inherits passive from config', () => {
  const { jpex: base } = setup();
  const jpex = base.extend({ precedence: 'passive' });
  type A = string;
  jpex.factory<A>(() => 'a');
  jpex.factory<A>(() => 'A');

  const result = jpex.resolve<A>();

  expect(result).toBe('a');
});

import base from '../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

it('resolves with given values', () => {
  const { jpex } = setup();

  type A = string;
  type B = string;
  type C = string;
  type D = string;

  jpex.factory<A>((b: B, c: C, d: D) => b + c + d);

  const result = jpex.resolveWith<A>({
    [jpex.infer<B>()]: 'b',
    [jpex.infer<C>()]: 'c',
    [jpex.infer<D>()]: 'd',
  });

  expect(result).toBe('bcd');
});

it('resolves using type inference (1)', () => {
  const { jpex } = setup();
  type A = string;
  type B = string;

  jpex.factory<A>((b: B) => `a${b}`);

  const result = jpex.resolveWith<A, B>(['b']);

  expect(result).toBe('ab');
});

it('resolves with type inference (6)', () => {
  const { jpex } = setup();
  type A = string;
  type B = string;
  type C = string;
  type D = string;
  type E = string;
  type F = string;
  type G = string;

  jpex.factory<A>(
    (b: B, c: C, d: D, e: E, f: F, g: G) => `a${b}${c}${d}${e}${f}${g}`,
  );

  const result = jpex.resolveWith<A, B, C, D, E, F, G>([
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
  ]);

  expect(result).toBe('abcdefg');
});

test('it resolves different values for different arguments', () => {
  const { jpex } = setup();
  type A = string;
  type B = string;

  jpex.factory<A>((b: B) => `a${b}`);
  jpex.factory<B>(() => 'z');

  const result1 = jpex.resolveWith<A, B>(['b']);
  const result2 = jpex.resolveWith<A, B>(['c']);
  const result3 = jpex.resolveWith<A, B>(['d']);
  const result4 = jpex.resolve<A>();

  expect(result1).toBe('ab');
  expect(result2).toBe('ac');
  expect(result3).toBe('ad');
  expect(result4).toBe('az');
});

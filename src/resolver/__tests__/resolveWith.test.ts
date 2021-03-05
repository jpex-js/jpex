import anyTest, { TestInterface } from 'ava';
import base, { JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const jpex = base.extend();

  t.context = {
    jpex,
  };
});

test('it resolves with given values', t => {
  const { jpex } = t.context;

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

  t.is(result, 'bcd');
});

test('it resolves using type inference (1)', t => {
  const { jpex } = t.context;
  type A = string;
  type B = string;

  jpex.factory<A>((b: B) => `a${b}`);

  const result = jpex.resolveWith<A, B>([ 'b' ]);

  t.is(result, 'ab');
});

test('it resolves with type inference (6)', t => {
  const { jpex } = t.context;
  type A = string;
  type B = string;
  type C = string;
  type D = string;
  type E = string;
  type F = string;
  type G = string;

  jpex.factory<A>((b: B, c: C, d: D, e: E, f: F, g: G) => `a${b}${c}${d}${e}${f}${g}`);

  const result = jpex.resolveWith<A, B, C, D, E, F, G>([ 'b', 'c', 'd', 'e', 'f', 'g' ]);

  t.is(result, 'abcdefg');
});

test('it resolves different values for different arguments', t => {
  const { jpex } = t.context;
  type A = string;
  type B = string;

  jpex.factory<A>((b: B) => `a${b}`);
  jpex.factory<B>(() => 'z');

  const result1 = jpex.resolveWith<A, B>([ 'b' ]);
  const result2 = jpex.resolveWith<A, B>([ 'c' ]);
  const result3 = jpex.resolveWith<A, B>([ 'd' ]);
  const result4 = jpex.resolve<A>();

  t.is(result1, 'ab');
  t.is(result2, 'ac');
  t.is(result3, 'ad');
  t.is(result4, 'az');
});
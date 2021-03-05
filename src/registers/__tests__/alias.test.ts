import { jpex } from '../..';

const setup = () => {
  return {
    jpex: jpex.extend(),
  };
};

test('it aliases a factory to a type', () => {
  const { jpex } = setup();
  type Bah = string;

  jpex.factory('foo', [], () => 'foo');
  jpex.alias<Bah>('foo');

  const result = jpex.resolve<Bah>();

  expect(result).toBe('foo');
});

test('it aliases a factory to a string', () => {
  const { jpex } = setup();
  type Foo = any;

  jpex.factory<Foo>(() => 'foo');
  jpex.alias<Foo>('bah');

  const result = jpex.resolve('bah');

  expect(result).toBe('foo');
});

test('it aliases two types', () => {
  const { jpex } = setup();
  type Foo = any;
  type Bah = any;

  jpex.factory<Foo>(() => 'foo');
  jpex.alias<Foo, Bah>();

  const result = jpex.resolve<Bah>();

  expect(result).toBe('foo');
});

test('aliases a factory at registration', () => {
  const { jpex } = setup();
  type Foo = any;
  type Bah = any;

  jpex.factory<Foo>(() => 'foo', { alias: [jpex.infer<Bah>()] });

  const result = jpex.resolve<Bah>();

  expect(result).toBe('foo');
});

test('respects precedence', () => {
  const { jpex } = setup();
  const jpex2 = jpex.extend({ precedence: 'passive' });

  type Foo = any;
  type Bah = any;

  jpex2.factory<Foo>(() => 'foo');
  jpex2.factory<Bah>(() => 'bah');
  jpex2.alias<Foo, Bah>();

  expect(jpex2.resolve<Foo>()).toBe('foo');
  expect(jpex2.resolve<Bah>()).toBe('bah');
});

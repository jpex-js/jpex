import base from '../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

test('if factory exists, it should be resolved', () => {
  const { jpex } = setup();
  type Foo = string;
  jpex.constant<Foo>('foo');

  const result = jpex.resolve<Foo>({ default: 'bar' });

  expect(result).toBe('foo');
});

test('if factory does not exist, it should return the default', () => {
  const { jpex } = setup();
  type Foo = string;

  const result = jpex.resolve<Foo>({ default: 'bar' });

  expect(result).toBe('bar');
});

test('if factory does not exist and default not provided, it should throw an error', () => {
  const { jpex } = setup();
  type Foo = string;

  expect(() => jpex.resolve<Foo>()).toThrow();
});

test('if factory does not exist and default is undefined, it should return undefined', () => {
  const { jpex } = setup();
  type Foo = string;

  const result = jpex.resolve<Foo>({ default: undefined });

  expect(result).toBe(undefined);
});

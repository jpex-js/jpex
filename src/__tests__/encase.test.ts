import jpex from '..';

const setup = () => ({
  jpex: jpex.extend(),
});

it('wraps a method with specified dependencies', () => {
  const { jpex } = setup();

  type Foo = string;
  const fn = jpex.encase((foo: Foo) => (bah: string) => foo + bah);

  jpex.constant<Foo>('injected');

  const result = fn('provided');

  expect(result).toBe('injectedprovided');
});

it('works with global interfaces', () => {
  const { jpex } = setup();

  jpex.constant<Window>(window);

  const fn = jpex.encase((window: Window) => () => window);

  const result = fn();

  expect(result).toBe(window);
});

it('works with async factories', async () => {
  const { jpex } = setup();

  type AsyncFactory = string;

  jpex.factoryAsync<AsyncFactory>(async () => 'async');

  const fn = jpex.encase((x: AsyncFactory) => async () => `${x}!`);

  const result = await fn();

  expect(result).toBe('async!');
});

it('exposes the inner function', () => {
  const { jpex } = setup();
  type Foo = string;

  const fn = jpex.encase((foo: Foo) => (bah: string) => foo + bah);
  const fn2 = fn.encased;

  const result = fn2('injected')('provided');

  expect(result).toBe('injectedprovided');
});

it('caches the inner function', () => {
  const { jpex } = setup();
  type Foo = string;

  jpex.constant<Foo>('injected');

  const spy = jest.fn((foo) => {
    return (bah: string) => {
      return foo + bah;
    };
  });
  const inner = (foo: Foo) => spy(foo);
  const fn = jpex.encase(inner);

  fn('provided');
  expect(spy).toBeCalledTimes(1);

  fn('xxx');
  expect(spy).toBeCalledTimes(1);

  jpex.clearCache();

  fn('yyy');
  expect(spy).toBeCalledTimes(2);
});

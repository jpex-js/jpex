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

it('keeps a list of encased dependencies', () => {
  const { jpex } = setup();

  type A = string;
  type B = string;
  type C = string;
  type D = string;

  const a = jpex.infer<A>();
  const b = jpex.infer<B>();
  const c = jpex.infer<C>();
  const d = jpex.infer<D>();

  // All initially undefined
  expect(jpex.$$deps).not.toContain(a);
  expect(jpex.$$deps).not.toContain(b);
  expect(jpex.$$deps).not.toContain(c);
  expect(jpex.$$deps).not.toContain(d);

  // Register a factory, since it has no dependencies, nothing should change
  jpex.factory<A>(() => 'a');

  expect(jpex.$$deps).not.toContain(a);
  expect(jpex.$$deps).not.toContain(b);
  expect(jpex.$$deps).not.toContain(c);
  expect(jpex.$$deps).not.toContain(d);

  // Create an encased function, both its dependencies should be added to deps
  jpex.encase((a: A, b: B) => () => a + b);

  expect(jpex.$$deps).toContain(a);
  expect(jpex.$$deps).toContain(b);
  expect(jpex.$$deps).not.toContain(c);
  expect(jpex.$$deps).not.toContain(d);

  // Create a factory with a dependency, the dependency should be added to deps
  jpex.factory<B>((c: C) => c);

  expect(jpex.$$deps).toContain(c);
  expect(jpex.$$deps).not.toContain(d);

  // Attempt to resolve a dependency directly, it should be added to deps
  jpex.resolve<D>({ optional: true });

  expect(jpex.$$deps).toContain(d);
});

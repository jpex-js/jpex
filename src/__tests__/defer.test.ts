import _jpex, { Jpex } from '..';

let jpex: Jpex;
type Foo = (v: string) => string;
type FooAsync = (v: string) => Promise<string>;
type Bar = string;

beforeEach(() => {
  jpex = _jpex.extend();

  jpex.factory<Foo>((bar: Bar) => (v: string) => `${v}foo${bar}`);
  jpex.factory<Bar>(() => 'bar');
  jpex.factory<FooAsync>((foo: Foo) => async (v: string) => `${foo(v)}async`);
});

it('returns a function', () => {
  const foo = jpex.defer<Foo>();

  expect(foo).toBeInstanceOf(Function);
});

it('does not resolve any dependencies at creation time', () => {
  jpex.defer<Foo>();

  expect(jpex.$$factories[jpex.infer<Foo>()]?.resolved).toBeFalsy();
  expect(jpex.$$resolved[jpex.infer<Foo>()]).toBeFalsy();
  expect(jpex.$$factories[jpex.infer<Bar>()]?.resolved).toBeFalsy();
  expect(jpex.$$resolved[jpex.infer<Bar>()]).toBeFalsy();
});

it('resolves and calls the factory at call time', () => {
  const foo = jpex.defer<Foo>();

  const result = foo('provided');

  expect(result).toBe('providedfoobar');
});

it('works with async factories', async () => {
  const foo = jpex.defer<FooAsync>();

  const result = await foo('provided');

  expect(result).toBe('providedfoobarasync');
});

it('caches the inner function', () => {
  const spyFactory = jest.fn(() => () => 'spy');

  jpex.factory<Foo>(spyFactory);

  const foo = jpex.defer<Foo>();

  expect(spyFactory).not.toHaveBeenCalled();

  foo('provided');

  expect(spyFactory).toHaveBeenCalledTimes(1);

  foo('provided');

  expect(spyFactory).toHaveBeenCalledTimes(1);

  jpex.clearCache();

  foo('provided');
  expect(spyFactory).toHaveBeenCalledTimes(2);
});

it('keeps a list of deferred dependencies', () => {
  jpex.defer<Foo>();

  expect(jpex.$$deps).toContain(jpex.infer<Foo>());
  expect(jpex.$$deps).toContain(jpex.infer<Bar>());
});

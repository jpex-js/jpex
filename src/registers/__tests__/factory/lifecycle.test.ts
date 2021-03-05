import { jpex as base } from '../../..';

type Foo = any;
type Factory = any;
type Test = any;

const setup = () => {
  const jpex = base.extend();
  const jpex2 = jpex.extend();
  const jpex3 = jpex2.extend();

  jpex.constant<Foo>('jpex');
  jpex2.constant<Foo>('jpex2');
  jpex3.constant<Foo>('jpex3');

  return {
    jpex,
    jpex2,
    jpex3,
  };
};

test('application returns the same instance for all classes', () => {
  const { jpex, jpex2, jpex3 } = setup();

  jpex.factory<Factory>((foo: Foo) => ({ foo }), { lifecycle: 'application' });

  const a = jpex.resolve<Factory>();
  const b = jpex2.resolve<Factory>();
  const c = jpex3.resolve<Factory>();

  expect(a).toBe(b);
  expect(b).toBe(c);
  expect(c.foo).toBe('jpex');
});

test('application uses the first resolution forever', () => {
  const { jpex, jpex2, jpex3 } = setup();

  jpex.factory<Factory>((foo: Foo) => ({ foo }), { lifecycle: 'application' });

  const c = jpex3.resolve<Factory>();
  const a = jpex.resolve<Factory>();
  const b = jpex2.resolve<Factory>();

  expect(a).toBe(b);
  expect(b).toBe(c);
  expect(c.foo).toBe('jpex3');
});

test('class returns different instances for each class', () => {
  const { jpex, jpex2, jpex3 } = setup();

  jpex.factory<Factory>((foo: Foo) => ({ foo }), { lifecycle: 'class' });

  const a = jpex.resolve<Factory>();
  const b = jpex2.resolve<Factory>();
  const c = jpex3.resolve<Factory>();

  expect(a).not.toBe(b);
  expect(b).not.toBe(c);
  expect(a.foo).toBe('jpex');
  expect(b.foo).toBe('jpex2');
  expect(c.foo).toBe('jpex3');
});

test('class returns the same instance within a single class', () => {
  const { jpex } = setup();

  jpex.factory<Factory>((foo: Foo) => ({ foo }), { lifecycle: 'class' });

  const a = jpex.resolve<Factory>();
  const b = jpex.resolve<Factory>();
  const c = jpex.resolve<Factory>();

  expect(a).toBe(b);
  expect(b).toBe(c);
});

test('instance returns a new instance for each separate call', () => {
  const { jpex } = setup();

  jpex.factory<Factory>((foo: Foo) => ({ foo }), { lifecycle: 'instance' });

  const a = jpex.resolve<Factory>();
  const b = jpex.resolve<Factory>();
  const c = jpex.resolve<Factory>();

  expect(a).not.toBe(b);
  expect(b).not.toBe(c);
});

test('instance returns a single instance within a single call', () => {
  const { jpex } = setup();

  jpex.factory<Factory>((foo: Foo) => ({ foo }), { lifecycle: 'instance' });
  jpex.factory<Test>((a: Factory, b: Factory) => {
    expect(a).toBe(b);
  });

  jpex.resolve<Test>();
});

test('none should return a different instance within a single call', () => {
  const { jpex } = setup();

  jpex.factory<Factory>((foo: Foo) => ({ foo }), { lifecycle: 'none' });
  jpex.factory<Test>((a: Factory, b: Factory) => {
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  jpex.resolve<Test>();
});

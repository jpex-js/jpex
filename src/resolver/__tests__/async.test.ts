import base from '../..';

test('default async factories', async () => {
  const jpex = base.extend();

  type FactoryA = Promise<string>;
  type FactoryB = () => Promise<{ value: string }>;

  jpex.factory<FactoryA>(async () => 'A');
  jpex.factory<FactoryB>((a: FactoryA) => async () => {
    return { value: await a };
  });

  const a = jpex.resolve<FactoryB>();
  const b = await a();
  expect(b).toEqual({ value: 'A' });
});

test('resolves asynchronous factories', async () => {
  const jpex = base.extend();

  type FactoryA = string;
  type FactoryB = { value: string };
  type FactoryC = FactoryB;

  jpex.factoryAsync<FactoryA>(async () => 'A');
  jpex.factoryAsync<FactoryB>(async (a: FactoryA) => {
    return { value: a };
  });
  jpex.factoryAsync<FactoryC>(async (b: FactoryB) => b);

  const a = await jpex.resolveAsync<FactoryB>();
  const b = await jpex.resolveAsync<FactoryB>();
  const c = await jpex.resolveAsync<FactoryA>();
  const d = await jpex.resolveAsync<FactoryC>();

  expect(a).toEqual({ value: 'A' });
  expect(b).toEqual({ value: 'A' });
  expect(c).toEqual('A');
  expect(d).toEqual({ value: 'A' });
});

test('mixed default/async factories', async () => {
  const jpex = base.extend();

  type FactoryA = Promise<string>;
  type FactoryB = { value: string };
  type FactoryC = FactoryB;

  jpex.factory<FactoryA>(async () => 'A');
  jpex.factoryAsync<FactoryB>(async (a: FactoryA) => {
    return { value: await a };
  });
  jpex.factory<FactoryC>((b: FactoryB) => b);

  const a = await jpex.resolve<FactoryC>();

  expect(a).toEqual({ value: 'A' });
});

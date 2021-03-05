import { jpex } from '../..';

const setup = () => {
  return {
    jpex: jpex.extend(),
  };
};

test('registers a constant', () => {
  const { jpex } = setup();

  type Foo = string;
  jpex.constant<Foo>('foo');

  expect(jpex.resolve<Foo>()).toBe('foo');
});

test('always resolves the same value', () => {
  const { jpex } = setup();
  const jpex2 = jpex.extend();
  const jpex3 = jpex.extend();

  type Foo = any;
  jpex.constant<Foo>({});

  const a = jpex3.resolve<Foo>();
  const b = jpex.resolve<Foo>();
  const c = jpex2.resolve<Foo>();

  expect(a).toBe(b);
  expect(b).toBe(c);
});

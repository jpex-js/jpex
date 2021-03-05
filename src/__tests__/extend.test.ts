import { jpex as base } from '..';

type Foo = string;

const setup = () => {
  const jpex = base.extend();
  jpex.constant<Foo>('foo');

  return { jpex };
};

it('returns a new jpex instance', () => {
  const { jpex } = setup();
  const jpex2 = jpex.extend();

  expect(typeof jpex2).toBe('object');
  expect(typeof jpex.resolve).toBe('function');
});

it('inherits dependencies', () => {
  const { jpex } = setup();
  const jpex2 = jpex.extend();
  const value = jpex2.resolve<Foo>();

  expect(value).toBe('foo');
});

it('overrides inherited dependencies', () => {
  const { jpex } = setup();
  const jpex2 = jpex.extend();
  jpex2.constant<Foo>('bah');
  const value = jpex2.resolve<Foo>();

  expect(value).toBe('bah');
});

it('does not inherit dependencies', () => {
  const { jpex } = setup();
  const jpex2 = jpex.extend({ inherit: false });
  const value = jpex2.resolve<Foo>({ optional: true });

  expect(value).toBe(void 0);
});

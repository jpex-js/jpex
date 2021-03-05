import base from '../../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

test('throws is name is not provided', () => {
  const { jpex } = setup();
  // @ts-expect-error intentionally missing the name parameter
  expect(() => jpex.factory([], () => null)).toThrow();
});

test('throws if dependencies not provided', () => {
  const { jpex } = setup();

  expect(() => jpex.factory('foo', void 0, () => null)).toThrow();
});

test('throws if factory is not provided', () => {
  const { jpex } = setup();

  // @ts-expect-error intentionally missing fn
  expect(() => jpex.factory('foo', [])).toThrow();
});

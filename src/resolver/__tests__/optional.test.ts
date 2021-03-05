/* eslint-disable no-invalid-this */
import base from '../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

test('throws if dependency does not exist', () => {
  const { jpex } = setup();
  type Doesnotexist = any;

  expect(() => jpex.resolve<Doesnotexist>()).toThrow();
});

test('does not throw if dependency is optional', () => {
  const { jpex } = setup();
  type Doesnotexist = any;

  expect(() => jpex.resolve<Doesnotexist>({ optional: true })).not.toThrow();
});

test("does not throw if optional dependency's dependencies fail", () => {
  const { jpex } = setup();
  type Doesnotexist = any;
  type Exists = any;
  jpex.factory<Exists>((x: Doesnotexist) => x);

  expect(() => jpex.resolve<Exists>({ optional: true })).not.toThrow();
});

test('does not throw if the default optional is set', () => {
  const { jpex: base } = setup();
  type Doesnotexist = any;
  const jpex = base.extend({ optional: true });

  expect(() => jpex.resolve<Doesnotexist>()).not.toThrow();
});

test('resolves an optional dependency', () => {
  const { jpex } = setup();
  type Exists = any;
  jpex.factory<Exists>(() => 'foo');
  const result = jpex.resolve<Exists>({ optional: true });

  expect(result).toBe('foo');
});

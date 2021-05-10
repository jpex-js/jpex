/* global global */
/* eslint-disable no-invalid-this */
import base, { Global } from '../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

afterEach(() => {
  delete (global as any).foo;
  delete (global as any).Foo;
});

test('resolves a global property', () => {
  const { jpex } = setup();

  const value = jpex.resolve<Window>();

  expect(value).toBe(window);
});

test('prefers a registered dependency over a global', () => {
  const { jpex } = setup();
  const fakeWindow = {};
  jpex.factory<Window>(() => fakeWindow as any);

  const value = jpex.resolve<Window>();

  expect(value).not.toBe(window);
  expect(value).toBe(fakeWindow);
});

test('allows a custom global variable', () => {
  const { jpex } = setup();
  (global as any).foo = 'hello';

  const value = jpex.resolve<Global<'foo'>>();

  expect(value).toBe('hello');
});

test('allows a custom global class', () => {
  const { jpex } = setup();
  class Foo {}
  (global as any).Foo = Foo;

  const value = jpex.resolve<Global<'Foo', typeof Foo>>();

  expect(value).toBe(Foo);
});

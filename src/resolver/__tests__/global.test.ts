/* global global */
/* eslint-disable no-invalid-this */
import anyTest, { TestInterface } from 'ava';
import base, { JpexInstance, Global } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const jpex = base.extend();

  t.context = {
    jpex,
  };
});

test('resolves a global property', t => {
  const { jpex } = t.context;

  const value = jpex.resolve<Window>();

  t.is(value, window);
});

test('prefers a registered dependency over a global', t => {
  const { jpex } = t.context;
  const fakeWindow = {};
  jpex.factory<Window>(() => fakeWindow as any);

  const value = jpex.resolve<Window>();

  t.not(value, window);
  t.is(value, fakeWindow);
});

test('allows a custom global variable', t => {
  const { jpex } = t.context;
  // @ts-ignore
  global.foo = 'hello';

  const value = jpex.resolve<Global<'foo'>>();

  t.is(value, 'hello');
});

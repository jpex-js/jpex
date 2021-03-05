/* eslint-disable no-invalid-this */
import fs from 'fs';
import base, { NodeModule } from '../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

test('resolves a node module', () => {
  const { jpex } = setup();

  const value = jpex.resolve<NodeModule<'fs'>>();

  expect(value).toBe(fs);
});

test('prefers a registered dependency over a node module', () => {
  const { jpex } = setup();
  const fakeFs = {};
  jpex.factory<NodeModule<'fs'>>(() => fakeFs);

  const value = jpex.resolve<NodeModule<'fs'>>();

  expect(value).not.toBe(fs);
  expect(value).toBe(fakeFs);
});

test('does not resolve a node module when disabled', () => {
  const { jpex: base } = setup();
  const jpex = base.extend({
    nodeModules: false,
    optional: true,
  });

  const value = jpex.resolve<NodeModule<'fs'>>();

  expect(value).not.toBe(fs);
  expect(value).toBe(void 0);
});

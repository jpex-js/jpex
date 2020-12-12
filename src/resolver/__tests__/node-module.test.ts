/* eslint-disable no-invalid-this */
import anyTest, { TestInterface } from 'ava';
import fs from 'fs';
import base, { JpexInstance, NodeModule } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const jpex = base.extend();

  t.context = {
    jpex,
  };
});

test('resolves a node module', t => {
  const { jpex } = t.context;

  const value = jpex.resolve<NodeModule<'fs'>>();

  t.is(value, fs);
});

test('prefers a registered dependency over a node module', t => {
  const { jpex } = t.context;
  const fakeFs = {};
  jpex.factory<NodeModule<'fs'>>(() => fakeFs);

  const value = jpex.resolve<NodeModule<'fs'>>();

  t.not(value, fs);
  t.is(value, fakeFs);
});

test('does not resolve a node module when disabled', t => {
  const { jpex: base } = t.context;
  const jpex = base.extend({
    nodeModules: false,
    optional: true,
  });

  const value = jpex.resolve<NodeModule<'fs'>>();

  t.not(value, fs);
  t.is(value, void 0);
});

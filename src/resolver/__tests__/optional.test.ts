/* eslint-disable no-invalid-this */
import anyTest, { TestInterface } from 'ava';
import base, { JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const jpex = base.extend();

  t.context = {
    jpex,
  };
});

test('throws if dependency does not exist', t => {
  const { jpex } = t.context;
  type Doesnotexist = any;

  t.throws(() => jpex.resolve<Doesnotexist>());
});

test('does not throw if dependency is optional', t => {
  const { jpex } = t.context;
  type Doesnotexist = any;

  t.notThrows(() => jpex.resolve<Doesnotexist>({ optional: true }));
});

test('does not throw if optional dependency\'s dependencies fail', t => {
  const { jpex } = t.context;
  type Doesnotexist = any;
  type Exists = any;
  jpex.factory<Exists>((x: Doesnotexist) => x);

  t.notThrows(() => jpex.resolve<Exists>({ optional: true }));
});

test('does not throw if the default optional is set', t => {
  const { jpex: base } = t.context;
  type Doesnotexist = any;
  const jpex = base.extend({ optional: true });

  t.notThrows(() => jpex.resolve<Doesnotexist>());
});

test('resolves an optional dependency', t => {
  const { jpex } = t.context;
  type Exists = any;
  jpex.factory<Exists>(() => 'foo');
  const result = jpex.resolve<Exists>({ optional: true });

  t.is(result, 'foo');
});

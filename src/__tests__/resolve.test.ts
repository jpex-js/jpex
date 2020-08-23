/* eslint-disable no-invalid-this */
import anyTest, { TestInterface } from 'ava';
import fs from 'fs';
import base, { JpexInstance } from '..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach((t) => {
  const jpex = base.extend();

  t.context = {
    jpex,
  };
});

test('resolves factories and services', (t) => {
  const { jpex } = t.context;
  type Factory = string;
  type Service = { val: string };
  type Dependent = { val: string };
  type Master = { val: string, sub: string };
  type Constant = string;

  jpex.factory<Factory>(() => 'FACTORY');
  jpex.service<Service>(class {
    val = 'SERVICE';
  });
  jpex.service<Dependent>(function() {
    this.val = 'DEPENDENT';
  });
  jpex.service<Master>(function(d: Dependent) {
    this.val = 'MASTER';
    this.sub = d.val;
  });
  jpex.constant<Constant>('CONSTANT');

  const f = jpex.resolve<Factory>();
  const s = jpex.resolve<Service>();
  const m = jpex.resolve<Master>();
  const c = jpex.resolve(jpex.infer<Constant>());

  t.is(f, 'FACTORY');
  t.is(s.val, 'SERVICE');
  t.is(m.val, 'MASTER');
  t.is(m.sub, 'DEPENDENT');
  t.is(c, 'CONSTANT');
});

test('resolves named dependencies', (t) => {
  const { jpex } = t.context;
  type Foo = string;
  type Named = string;

  jpex.factory<Foo>((named: Named) => named);
  const result = jpex.resolve<Foo>({
    with: {
      [jpex.infer<Named>()]: 'pop',
    },
  });

  t.is(result, 'pop');
});

test('throws if dependency does not exist', (t) => {
  const { jpex } = t.context;

  t.throws(() => jpex.resolve('doesnotexist'));
});

test('does not throw if dependency is optional', (t) => {
  const { jpex } = t.context;

  t.notThrows(() => jpex.resolve('notexists', { optional: true }));
});

test('does not throw if optional dependency\'s dependencies fail', (t) => {
  const { jpex } = t.context;
  jpex.factory('exists', [ 'doesnotexist' ], (x) => x);

  t.notThrows(() => jpex.resolve('exists', { optional: true }));
});

test('does not throw if the default optional is set', (t) => {
  const { jpex: base } = t.context;
  const jpex = base.extend({ optional: true });

  t.notThrows(() => jpex.resolve('doesnotexist'));
});

test('resolves an optional dependency', (t) => {
  const { jpex } = t.context;
  jpex.factory('exists', [], () => 'foo');
  const result = jpex.resolve('exists', { optional: true });

  t.is(result, 'foo');
});

test('throws if dependency is recurring', (t) => {
  const { jpex } = t.context;
  jpex.factory('a', [ 'b' ], (b) => b);
  jpex.factory('b', [ 'a' ], (a) => a);

  t.throws(() => jpex.resolve('a'));
});

test('resolves array-like dependencies', (t) => {
  const { jpex } = t.context;
  type Keys = string[];
  type Value = string;
  jpex.constant<Keys>([ 'hello', 'world' ]);
  jpex.factory<Value>((keys: Keys) => keys[0]);

  const value = jpex.resolve<Value>();

  t.is(value, 'hello');
});

test('resolves a node module', (t) => {
  const { jpex } = t.context;

  const value = jpex.resolve('fs');

  t.is(value, fs);
});

test('prefers a registered dependency over a node module', (t) => {
  const { jpex } = t.context;
  const fakeFs = {};
  jpex.factory('fs', [], () => fakeFs as any);

  const value = jpex.resolve('fs');

  t.not(value, fs);
  t.is(value, fakeFs);
});

test('resolves a global property', (t) => {
  const { jpex } = t.context;

  const value = jpex.resolve('window');

  t.is(value, window);
});

test('resolves a global type', (t) => {
  const { jpex } = t.context;

  const value = jpex.resolve<Window>();

  t.is(value, window);
});

test('prefers a registered dependency over a global', (t) => {
  const { jpex } = t.context;
  const fakeWindow = {};
  jpex.factory<Window>(() => fakeWindow as any);

  const value = jpex.resolve<Window>();

  t.not(value, window);
  t.is(value, fakeWindow);
});

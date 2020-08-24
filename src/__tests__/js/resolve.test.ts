/* eslint-disable no-invalid-this */
import anyTest, { TestInterface } from 'ava';
import fs from 'fs';
import base, { JpexInstance } from '../..';

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

  jpex.factory('factory', [], () => 'FACTORY');
  jpex.service('service', [], class {
    val = 'SERVICE';
  });
  jpex.service('dependent', [], function() {
    this.val = 'DEPENDENT';
  });
  jpex.service('master', [ 'dependent' ], function(d) {
    this.val = 'MASTER';
    this.sub = d.val;
  });
  jpex.constant('constant', 'CONSTANT');

  const f = jpex.resolve('factory');
  const s = jpex.resolve('service');
  const m = jpex.resolve('master');
  const c = jpex.resolve('constant');

  t.is(f, 'FACTORY');
  t.is(s.val, 'SERVICE');
  t.is(m.val, 'MASTER');
  t.is(m.sub, 'DEPENDENT');
  t.is(c, 'CONSTANT');
});

test('resolves named dependencies', (t) => {
  const { jpex } = t.context;

  jpex.factory('foo', [ 'named' ], (named) => named);
  const result = jpex.resolve('foo', {
    with: {
      named: 'pop',
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
  jpex.constant('keys', [ 'hello', 'world' ]);
  jpex.factory('value', [ 'keys' ], (keys) => keys[0]);

  const value = jpex.resolve('value');

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

test('prefers a registered dependency over a global', (t) => {
  const { jpex } = t.context;
  const fakeWindow = {};
  jpex.factory('window', [], () => fakeWindow as any);

  const value = jpex.resolve('window');

  t.not(value, window);
  t.is(value, fakeWindow);
});

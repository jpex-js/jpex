import anyTest, { TestInterface } from 'ava';
import { jpex as base, JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
  jpex2: JpexInstance,
  jpex3: JpexInstance,
}> = anyTest;

test.beforeEach((t) => {
  const jpex = base.extend();
  const jpex2 = jpex.extend();
  const jpex3 = jpex2.extend();

  jpex.constant('foo', 'jpex');
  jpex2.constant('foo', 'jpex2');
  jpex3.constant('foo', 'jpex3');

  t.context = {
    jpex,
    jpex2,
    jpex3,
  };
});

test('application returns the same instance for all classes', (t) => {
  const {
    jpex,
    jpex2,
    jpex3,
  } = t.context;

  jpex.factory('factory', [ 'foo' ], (foo) => ({ foo }), { lifecycle: 'application' });

  const a = jpex.resolve('factory');
  const b = jpex2.resolve('factory');
  const c = jpex3.resolve('factory');

  t.is(a, b);
  t.is(b, c);
  t.is(c.foo, 'jpex');
});

test('application uses the first resolution forever', (t) => {
  const {
    jpex,
    jpex2,
    jpex3,
  } = t.context;

  jpex.factory('factory', [ 'foo' ], (foo) => ({ foo }), { lifecycle: 'application' });

  const c = jpex3.resolve('factory');
  const a = jpex.resolve('factory');
  const b = jpex2.resolve('factory');

  t.is(a, b);
  t.is(b, c);
  t.is(c.foo, 'jpex3');
});

test('class returns different instances for each class', (t) => {
  const {
    jpex,
    jpex2,
    jpex3,
  } = t.context;

  jpex.factory('factory', [ 'foo' ], (foo) => ({ foo }), { lifecycle: 'class' });

  const a = jpex.resolve('factory');
  const b = jpex2.resolve('factory');
  const c = jpex3.resolve('factory');

  t.not(a, b);
  t.not(b, c);
  t.is(a.foo, 'jpex');
  t.is(b.foo, 'jpex2');
  t.is(c.foo, 'jpex3');
});

test('class returns the same instance within a single class', (t) => {
  const {
    jpex,
  } = t.context;

  jpex.factory('factory', [ 'foo' ], (foo) => ({ foo }), { lifecycle: 'class' });

  const a = jpex.resolve('factory');
  const b = jpex.resolve('factory');
  const c = jpex.resolve('factory');

  t.is(a, b);
  t.is(b, c);
});

test('instance returns a new instance for each separate call', (t) => {
  const {
    jpex,
  } = t.context;

  jpex.factory('factory', [ 'foo' ], (foo) => ({ foo }), { lifecycle: 'instance' });

  const a = jpex.resolve('factory');
  const b = jpex.resolve('factory');
  const c = jpex.resolve('factory');

  t.not(a, b);
  t.not(b, c);
});

test('instance returns a single instance within a single call', (t) => {
  const {
    jpex,
  } = t.context;

  jpex.factory('factory', [ 'foo' ], (foo) => ({ foo }), { lifecycle: 'instance' });
  jpex.factory('test', [ 'factory', 'factory' ], (a, b) => {
    t.is(a, b);
  });

  jpex.resolve('test');
});

test('none should return a different instance within a single call', (t) => {
  const {
    jpex,
  } = t.context;

  jpex.factory('factory', [ 'foo' ], (foo) => ({ foo }), { lifecycle: 'none' });
  jpex.factory('test', [ 'factory', 'factory' ], (a, b) => {
    t.not(a, b);
    t.deepEqual(a, b);
  });

  jpex.resolve('test');
});

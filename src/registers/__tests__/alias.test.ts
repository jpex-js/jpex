import anyTest, { TestInterface } from 'ava';
import { jpex, JpexInstance } from '../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  t.context = {
    jpex: jpex.extend(),
  };
});

test('it aliases a factory to a type', t => {
  const { jpex } = t.context;
  type Bah = string;

  jpex.factory('foo', [], () => 'foo');
  jpex.alias<Bah>('foo');

  const result = jpex.resolve<Bah>();

  t.is(result, 'foo');
});

test('it aliases a factory to a string', t => {
  const { jpex } = t.context;
  type Foo = any;

  jpex.factory<Foo>(() => 'foo');
  jpex.alias<Foo>('bah');

  const result = jpex.resolve('bah');

  t.is(result, 'foo');
});

test('it aliases two types', t => {
  const { jpex } = t.context;
  type Foo = any;
  type Bah = any;

  jpex.factory<Foo>(() => 'foo');
  jpex.alias<Foo, Bah>();

  const result = jpex.resolve<Bah>();

  t.is(result, 'foo');
});

test('aliases a factory at registration', t => {
  const { jpex } = t.context;
  type Foo = any;
  type Bah = any;

  jpex.factory<Foo>(() => 'foo', { alias: [ jpex.infer<Bah>() ] });

  const result = jpex.resolve<Bah>();

  t.is(result, 'foo');
});

test('respects precedence', t => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend({ precedence: 'passive' });

  type Foo = any;
  type Bah = any;

  jpex2.factory<Foo>(() => 'foo');
  jpex2.factory<Bah>(() => 'bah');
  jpex2.alias<Foo, Bah>();

  t.is(jpex2.resolve<Foo>(), 'foo');
  t.is(jpex2.resolve<Bah>(), 'bah');
});

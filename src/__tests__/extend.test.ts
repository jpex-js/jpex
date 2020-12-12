import anyTest, { TestInterface } from 'ava';
import { jpex as base, JpexInstance } from '..';

type Foo = string;

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const jpex = base.extend();
  t.context = {
    jpex,
  };

  jpex.constant<Foo>('foo');
});

test('returns a new jpex instance', t => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend();

  t.is(typeof jpex2, 'object');
  t.is(typeof jpex.resolve, 'function');
});

test('inherits dependencies', t => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend();
  const value = jpex2.resolve<Foo>();

  t.is(value, 'foo');
});

test('overrides inherited dependencies', t => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend();
  jpex2.constant<Foo>('bah');
  const value = jpex2.resolve<Foo>();

  t.is(value, 'bah');
});

test('does not inherit dependencies', t => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend({ inherit: false });
  const value = jpex2.resolve<Foo>({ optional: true });

  t.is(value, void 0);
});

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

test('registers a constant', t => {
  const { jpex } = t.context;

  type Foo = string;
  jpex.constant<Foo>('foo');

  t.is(jpex.resolve<Foo>(), 'foo');
});

test('always resolves the same value', t => {
  const { jpex } = t.context;
  const jpex2 = jpex.extend();
  const jpex3 = jpex.extend();

  type Foo = any;
  jpex.constant<Foo>({});

  const a = jpex3.resolve<Foo>();
  const b = jpex.resolve<Foo>();
  const c = jpex2.resolve<Foo>();

  t.is(a, b);
  t.is(b, c);
});

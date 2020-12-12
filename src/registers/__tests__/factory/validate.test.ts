import anyTest, { TestInterface } from 'ava';
import base, { JpexInstance } from '../../..';

const test: TestInterface<{
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const jpex = base.extend();

  t.context = {
    jpex,
  };
});

test('throws is name is not provided', t => {
  const { jpex } = t.context;
  // @ts-ignore
  t.throws(() => jpex.factory([], () => {}));
});

test('throws if dependencies not provided', t => {
  const { jpex } = t.context;

  // @ts-ignore
  t.throws(() => jpex.factory('foo', void 0, () => {}));
});

test('throws if factory is not provided', t => {
  const { jpex } = t.context;

  // @ts-ignore
  t.throws(() => jpex.factory('foo', []));
});

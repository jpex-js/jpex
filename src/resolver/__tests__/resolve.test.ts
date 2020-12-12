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

test('resolves factories and services', t => {
  const { jpex } = t.context;
  type Factory = string;
  type Service = { val: string };
  type Dependent = { val: string };
  type Master = { val: string, sub: string };
  type Constant = string;
  class ComplexConcrete {
    val: string;
    constructor(dep: Dependent) {
      this.val = dep.val;
    }
  }

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
  jpex.service<ComplexConcrete>(ComplexConcrete);
  jpex.constant<Constant>('CONSTANT');

  const f = jpex.resolve<Factory>();
  const s = jpex.resolve<Service>();
  const m = jpex.resolve<Master>();
  const cc = jpex.resolve<ComplexConcrete>();
  const c = jpex.resolve(jpex.infer<Constant>());

  t.is(f, 'FACTORY');
  t.is(s.val, 'SERVICE');
  t.is(m.val, 'MASTER');
  t.is(m.sub, 'DEPENDENT');
  t.is(cc.val, 'DEPENDENT');
  t.is(c, 'CONSTANT');
});

test('resolves named dependencies', t => {
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

test('throws if dependency is recurring', t => {
  const { jpex } = t.context;
  type A = any; type B = any;
  jpex.factory<A>((b: B) => b);
  jpex.factory<B>((a: A) => a);

  t.throws(() => jpex.resolve('a'));
});

test('resolves array-like dependencies', t => {
  const { jpex } = t.context;
  type Keys = string[];
  type Value = string;
  jpex.constant<Keys>([ 'hello', 'world' ]);
  jpex.factory<Value>((keys: Keys) => keys[0]);

  const value = jpex.resolve<Value>();

  t.is(value, 'hello');
});

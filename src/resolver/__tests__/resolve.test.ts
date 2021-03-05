/* eslint-disable max-classes-per-file */
/* eslint-disable no-invalid-this */
import base from '../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

test('resolves factories and services', () => {
  const { jpex } = setup();
  type Factory = string;
  type Service = { val: string };
  type Dependent = { val: string };
  type Master = { val: string; sub: string };
  type Constant = string;
  class ComplexConcrete {
    val: string;

    constructor(dep: Dependent) {
      this.val = dep.val;
    }
  }

  jpex.factory<Factory>(() => 'FACTORY');
  jpex.service<Service>(
    class {
      val = 'SERVICE';
    },
  );
  jpex.service<Dependent>(function dependent() {
    this.val = 'DEPENDENT';
  });
  jpex.service<Master>(function master(d: Dependent) {
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

  expect(f).toBe('FACTORY');
  expect(s.val).toBe('SERVICE');
  expect(m.val).toBe('MASTER');
  expect(m.sub).toBe('DEPENDENT');
  expect(cc.val).toBe('DEPENDENT');
  expect(c).toBe('CONSTANT');
});

test('resolves named dependencies', () => {
  const { jpex } = setup();
  type Foo = string;
  type Named = string;

  jpex.factory<Foo>((named: Named) => named);
  const result = jpex.resolve<Foo>({
    with: {
      [jpex.infer<Named>()]: 'pop',
    },
  });

  expect(result).toBe('pop');
});

test('throws if dependency is recurring', () => {
  const { jpex } = setup();
  type A = any;
  type B = any;
  jpex.factory<A>((b: B) => b);
  jpex.factory<B>((a: A) => a);

  expect(() => jpex.resolve('a')).toThrow();
});

test('resolves array-like dependencies', () => {
  const { jpex } = setup();
  type Keys = string[];
  type Value = string;
  jpex.constant<Keys>(['hello', 'world']);
  jpex.factory<Value>((keys: Keys) => keys[0]);

  const value = jpex.resolve<Value>();

  expect(value).toBe('hello');
});

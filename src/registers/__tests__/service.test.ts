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

test('registers a class service', t => {
  const { jpex } = t.context;

  class Service {
    val = 'SERVICE';
  }

  jpex.service<Service>(Service);

  t.is(jpex.resolve<Service>().val, 'SERVICE');
});

test('registers a function service', t => {
  const { jpex } = t.context;

  type Service = { val: string };
  function service() {
    this.val = 'SERVICE';
  }

  jpex.service<Service>(service);

  t.is(jpex.resolve<Service>().val, 'SERVICE');
});

test('infers services from class names', t => {
  const { jpex } = t.context;

  class Service1 {
    val = 'SERVICE1';
  }
  jpex.service(Service1);
  jpex.service(class Service2 {
    val = 'SERVICE2';
  });
  class Service3 {
    val = 'SERVICE3';
  }
  jpex.service(Service3, { precedence: 'passive' });

  jpex.resolve<Service1>();
  jpex.resolve<Service3>();

  t.pass();
});

test('infers services from class interfaces', t => {
  const { jpex } = t.context;

  interface IService {}
  interface IService1 {}
  interface IService2 {}
  interface IService3 {}

  class Service1 implements IService, IService1 {
    val = 'SERVICE1';
  }
  jpex.service(Service1);
  jpex.service(class Service2 implements IService, IService2 {
    val = 'SERVICE2';
  });
  class Service3 implements IService, IService3 {
    val = 'SERVICE3';
  }
  jpex.service(Service3, { precedence: 'passive' });

  jpex.resolve<IService>();
  jpex.resolve<IService1>();
  jpex.resolve<IService2>();
  jpex.resolve<IService3>();

  t.pass();
});

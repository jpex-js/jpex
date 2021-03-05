/* eslint-disable max-classes-per-file */
import base from '../..';

const setup = () => {
  const jpex = base.extend();

  return {
    jpex,
  };
};

test('registers a class service', () => {
  const { jpex } = setup();

  class Service {
    val = 'SERVICE';
  }

  jpex.service<Service>(Service);

  expect(jpex.resolve<Service>().val).toBe('SERVICE');
});

test('registers a function service', () => {
  const { jpex } = setup();

  type Service = { val: string };
  function service() {
    this.val = 'SERVICE';
  }

  jpex.service<Service>(service);

  expect(jpex.resolve<Service>().val).toBe('SERVICE');
});

test('infers services from class names', () => {
  const { jpex } = setup();

  class Service1 {
    val = 'SERVICE1';
  }
  jpex.service(Service1);
  jpex.service(
    class Service2 {
      val = 'SERVICE2';
    },
  );
  class Service3 {
    val = 'SERVICE3';
  }
  jpex.service(Service3, { precedence: 'passive' });

  jpex.resolve<Service1>();
  jpex.resolve<Service3>();

  expect(true).toBe(true);
});

test('infers services from class interfaces', () => {
  const { jpex } = setup();

  type IService = Record<string, unknown>;
  type IService1 = Record<string, unknown>;
  type IService2 = Record<string, unknown>;
  type IService3 = Record<string, unknown>;

  class Service1 implements IService, IService1 {
    [x: string]: unknown;

    val = 'SERVICE1';
  }
  jpex.service(Service1);
  jpex.service(
    class Service2 implements IService, IService2 {
      [x: string]: unknown;

      val = 'SERVICE2';
    },
  );
  class Service3 implements IService, IService3 {
    [x: string]: unknown;

    val = 'SERVICE3';
  }
  jpex.service(Service3, { precedence: 'passive' });

  jpex.resolve<IService>();
  jpex.resolve<IService1>();
  jpex.resolve<IService2>();
  jpex.resolve<IService3>();

  expect(true).toBe(true);
});

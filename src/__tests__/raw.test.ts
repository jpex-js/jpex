import base from '..';

const setup = () => ({
  jpex: base.extend(),
});

it('returns the raw factory by name', () => {
  const { jpex } = setup();
  type Constant = string;
  type Factory = string;

  jpex.constant<Constant>('foo');
  jpex.factory<Factory>((v: Constant) => {
    return v.split('').reverse().join('');
  });

  const factory = jpex.raw<Factory>();
  const result = factory('bah');

  expect(result).toBe('hab');
});

it('throws when not found', () => {
  const { jpex } = setup();
  type NotFound = any;

  expect(() => jpex.raw<NotFound>()).toThrow();
});

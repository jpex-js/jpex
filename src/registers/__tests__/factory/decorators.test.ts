/* eslint-disable newline-per-chained-call */
/* eslint-disable no-invalid-this */
import { jpex as base } from '../../..';

interface Voice {
  shout(str: string): string;
}

const setup = () => {
  const base2 = base.extend();
  base2.service<Voice>(function voice() {
    this.shout = (str: string) => {
      return `${str}!`;
    };
  });
  const jpex = base2.extend();

  return {
    base,
    base2,
    jpex,
  };
};

test('decorates a factory', () => {
  const { jpex } = setup();
  jpex.factory<Voice>((voice: Voice) => {
    const original = voice.shout;
    // eslint-disable-next-line no-param-reassign
    voice.shout = (str: string) => original(str.toUpperCase());
    return voice;
  });
  const voice = jpex.resolve<Voice>();
  const result = voice.shout('hello');

  expect(result).toBe('HELLO!');
});

test('decorators do not propogate up', () => {
  const { jpex, base2 } = setup();
  jpex.factory<Voice>((voice: Voice) => {
    const original = voice.shout;
    // eslint-disable-next-line no-param-reassign
    voice.shout = (str: string) => original(str.toUpperCase());
    return voice;
  });
  const voice = base2.resolve<Voice>();
  const result = voice.shout('hello');

  expect(result).toBe('hello!');
});

/* eslint-disable newline-per-chained-call */
/* eslint-disable no-invalid-this */
import anyTest, { TestInterface } from 'ava';
import { jpex as base, JpexInstance } from '../..';

interface Voice {
  shout(str: string): string
}

const test: TestInterface<{
  base: JpexInstance,
  base2: JpexInstance,
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach(t => {
  const base2 = base.extend();
  base2.service<Voice>(function() {
    this.shout = (str: string) => {
      return `${str}!`;
    };
  });
  const jpex = base2.extend();

  t.context = {
    base,
    base2,
    jpex,
  };
});

test('decorates a factory', t => {
  const { jpex } = t.context;
  jpex.factory<Voice>((voice: Voice) => {
    const original = voice.shout;
    voice.shout = (str: string) => original(str.toUpperCase());
    return voice;
  });
  const voice = jpex.resolve<Voice>();
  const result = voice.shout('hello');

  t.is(result, 'HELLO!');
});

test('decorators do not propogate up', t => {
  const { jpex, base2 } = t.context;
  jpex.factory<Voice>((voice: Voice) => {
    const original = voice.shout;
    voice.shout = (str: string) => original(str.toUpperCase());
    return voice;
  });
  const voice = base2.resolve<Voice>();
  const result = voice.shout('hello');

  t.is(result, 'hello!');
});

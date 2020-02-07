/* eslint-disable newline-per-chained-call */
/* eslint-disable no-invalid-this */
import anyTest, { TestInterface } from 'ava';
import { jpex as base, JpexInstance, Lifecycle } from '..';

interface Voice {
  shout(str: string): string
}
const name = base.infer<Voice>();

const test: TestInterface<{
  base: JpexInstance,
  base2: JpexInstance,
  jpex: JpexInstance,
}> = anyTest;

test.beforeEach((t) => {
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

test('decorates a factory', (t) => {
  const { jpex } = t.context;
  jpex.decorator<Voice>((voice) => {
    const original = voice.shout;
    voice.shout = (str: string) => original(str.toUpperCase());
    return voice;
  });
  const voice = jpex.resolve<Voice>();
  const result = voice.shout('hello');

  t.is(result, 'HELLO!');
});

test('registers multiple decorators', (t) => {
  const { jpex } = t.context;
  jpex.decorator<Voice>((voice) => {
    const original = voice.shout;
    voice.shout = (str: string) => original(str.toUpperCase());
    return voice;
  });
  jpex.decorator<Voice>((voice) => {
    const original = voice.shout;
    voice.shout = (str: string) => original(str.split('').reverse().join(''));
    return voice;
  });
  const voice = jpex.resolve<Voice>();
  const result = voice.shout('hello');

  t.is(result, 'OLLEH!');
});

test('decorators do not propogate up', (t) => {
  const { jpex, base2 } = t.context;
  jpex.decorator<Voice>((voice) => {
    const original = voice.shout;
    voice.shout = (str: string) => original(str.toUpperCase());
    return voice;
  });
  const voice = base2.resolve<Voice>();
  const result = voice.shout('hello');

  t.is(result, 'hello!');
});

test('clears the factory cache (application)', (t) => {
  const { jpex } = t.context;
  jpex.$$factories[name].lifecycle = Lifecycle.APPLICATION;
  let voice = jpex.resolve<Voice>();
  t.is(jpex.resolve<Voice>(), voice);

  jpex.decorator<Voice>((voice) => voice);

  t.not(jpex.resolve<Voice>(), voice);
  voice = jpex.resolve<Voice>();
  t.is(jpex.resolve<Voice>(), voice);
});

test('clears the factory cache (class)', (t) => {
  const { jpex } = t.context;
  jpex.$$factories[name].lifecycle = Lifecycle.CLASS;
  let voice = jpex.resolve<Voice>();
  t.is(jpex.resolve<Voice>(), voice);

  jpex.decorator<Voice>((voice) => voice);

  t.not(jpex.resolve<Voice>(), voice);
  voice = jpex.resolve<Voice>();
  t.is(jpex.resolve<Voice>(), voice);
});

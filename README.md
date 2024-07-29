# ![Jpex](https://jpex-js.github.io/dist/jpex.svg)

## Easy Dependency Injection

[![Build Status](https://travis-ci.org/jpex-js/jpex.svg?branch=master)](https://travis-ci.org/jackmellis/jpex)
[![npm version](https://badge.fury.io/js/jpex.svg)](https://badge.fury.io/js/jpex)
[![Code Climate](https://codeclimate.com/github/jackmellis/jpex/badges/gpa.svg)](https://codeclimate.com/github/jackmellis/jpex)
[![Test Coverage](https://codeclimate.com/github/jackmellis/jpex/badges/coverage.svg)](https://codeclimate.com/github/jackmellis/jpex/coverage)

Jpex is an Inversion of Control framework. Register dependencies on a container, then resolve them anywhere in your application. The real magic of jpex is its ability to infer dependencies using the magic of babel and typescript...

## Contents

- [Getting Started](#getting-started)
- [Registering Dependencies](#registering-dependencies)
- [Consuming Dependencies](#consuming-dependencies)
- [API](#api)
  - [jpex](#jpex)
    - [constant](#jpexconstant)
    - [factory](#jpexfactory)
      - [lifecycle](#lifecycle)
      - [precedence](#precedence)
      - [bindToInstance](#bindtoinstance)
      - [alias](#alias)
    - [service](#jpexservice)
    - [factoryAsync](#jpexfactoryAsync)
    - [alias](#jpexalias)
    - [resolve](#jpexresolve)
      - [optional](#optional)
      - [with](#with)
    - [resolveAsync][#jpexresolveasync]
    - [resolveWith](#jpexresolvewith)
    - [encase](#jpexencase)
    - [extend](#jpexextend)
      - [inherit](#inherit)
      - [lifecycle](#lifecycle-1)
      - [precedence](#precedence-1)
      - [optional](#optional-1)
      - [nodeModules](#nodemodules)
      - [globals](#globals)
    - [raw](#jpexraw)
    - [clearCache](#jpexclearcache)
    - [infer](#jpexinfer)
  - [Types](#types)
    - [Jpex](#jpex)
    - [NodeModule](#nodemodule)
    - [Global](#global)
- [caveats](#caveats)
- [react](#react)
- [Vanilla JS mode](#vanilla-js-mode)

## Getting Started

### Install

```
npm install jpex
```

### Plugin

Jpex uses babel to infer type interfaces at build time. You can do this with one of several methods:  
[@jpex-js/babel-plugin](https://github.com/jpex-js/babel-plugin)  
[@jpex-js/rollup-plugin](https://github.com/jpex-js/rollup-plugin)  
[@jpex-js/webpack-plugin](https://github.com/jpex-js/webpack-loader)

Jpex comes bundled with the `@jpex-js/babel-plugin` so you can easily get started with a `.babelrc` like this:

```js
// .bablerc
{
  presets: [ '@babel/preset-typescript' ],
  plugins: [ 'jpex/babel-plugin' ]
}
```

### Usage

```ts
import jpex from 'jpex';
import { Foo, Bah } from './types';

jpex.factory<Foo>((bah: Bah) => bah.baz);

const foo = jpex.resolve<Foo>();
```

---

## Registering Dependencies

Services and factories are small modules or functions that provide a common piece of functionality.

### factories

```ts
type MyFactory = {};

jpex.factory<MyFactory>(() => {
  return {};
});
```

### services

```ts
class MyService = {
  method: (): any {
    // ...
  }
};

jpex.service(MyService);
```

### constants

```ts
type MyConstant = string;
jpex.constant<MyConstant>('foo');
```

---

## Consuming Dependencies

### resolve

You can then resolve a dependency anywhere in your app:

```ts
const value = jpex.resolve<MyFactory>();
```

### dependent factories

A factory can request another dependency and jpex will resolve it on the fly:

```ts
jpex.constant<MyConstant>('foo');

jpex.factory<MyFactory>((myConstant: MyConstant) => {
  return `my constant is ${myConstant}`;
});

jpex.resolve<MyFactory>(); // "my constant is foo"
```

### encase

Or you can _encase_ a regular function so that dependencies are injected into it when called:

```ts
const fn = jpex.encase((value: MyFactory) => (arg1, arg2) => {
  return value + arg1 + arg2;
});

fn(1, 2);
```

---

## API

### jpex

#### jpex.constant

```ts
<T>(obj: T): void
```

Registers a constant value.

#### jpex.factory

```ts
<T>(fn: (...deps: any[] => T), opts?: object): void
```

Registers a factory function against the given type. Jpex works out the types of `deps` and injects them at resolution time, then returns the resulting value `T`.

```ts
type GetStuff = () => Promise<string>;

jpex.factory<GetStuff>((window: Window) => () => window.fetch('/stuff));
```

> By default jpex will automatically resolve global types like Window or Document. In a node environment it will also be able to resolve node_modules.

The following options can be provided for both factories and services:

##### lifecycle

```ts
'application' | 'class' | 'instance' | 'none';
```

Determines how long the factory is cached for once resolved.

- `application` is resolved forever across all containers
- `class` is resolved for the current jpex container, if you `.extend()` the new container will resolve it again
- `instance` if you request the same dependency multiple times in the same `resolve` call, this will use the same value, but the next time you call `resolve` it will start again
- `none` never caches anything

The default lifecycle is `class`

##### precedence

```ts
'active' | 'passive';
```

Determines the behavior when the same factory is registered multiple times.

- `active` overwrites the existing factory
- `passive` prefers the existing factory

Defaults to `active`

##### bindToInstance

```ts
boolean;
```

Specifically for services, automatically binds all of the dependencies to the service instance.

##### alias

```ts
string | string[]
```

Creates aliases for the factory. This is essentially just shorthand for writing `jpex.factory(...); jpex.alias(...);`

#### jpex.service

```ts
<T>(class: ClassWithConstructor, opts?: object): void
```

Registers a service. A service is like a factory but instantiates a class instead.

```ts
class Foo {
  constructor(window: Window) {
    // ...
  }
}

jpex.service(Foo);
```

If a class `implements` an interface, you can actually use it to resolve the class:

```ts
interface IFoo {}

class Foo implements IFoo {}

jpex.service(Foo);

const foo = jpex.resolve<IFoo>();
```

#### jpex.factoryAsync

```ts
<T>(fn: (...deps: any[] => Promise<T>), opts?: object): void
```

Registers an asynchronous factory. The factory should return a promise that resolves to type `T`. If you are using async factories, you should ensure you are using `resolveAsync`, this will wait for asynchronous factories to resolve before passing them to their dependents.

#### jpex.alias

```ts
<T>(alias: string): void
```

Creates an alias to another factory

#### jpex.resolve

```ts
<T>(opts?: object): T
```

Locates and resolves the desired factory.

```ts
const foo = jpex.resolve<Foo>();
```

The following options can be provided for both `resolve` and `resolveWith`:

##### optional

```ts
boolean;
```

When `true` if the dependency cannot be found or resolved, it will just return `undefined` rather than throwing an error.

#### jpex.resolveAsync

```ts
<T>(opts?: object): Promise<T>
```

Locates and resolves the desired factory. Unlike `resolve`, this method returns a promise and allows all asynchronous dependents to resolve before returning the final value.

#### jpex.resolveWith

```ts
<T, ...Rest[]>(values: Rest, opts?: object): T
```

Resolves a factory while substituting dependencies for the given values

```ts
const foo = jpex.resolveWith<Foo, Bah, Baz>(['bah', 'baz']);
```

#### jpex.resolveWithAsync

```ts
<T, ...Rest[]>(values: Rest, opts?: object): Promise<T>
```

This is an asynchronous version of `resolveWith` and returns a promise that will resolve all dependent factories.

#### jpex.encase

```ts
(...deps: any[]): (...args: any[]) => any
```

Wraps a function and injects values into it, it then returns the inner function for use.

```ts
const getStuff = jpex.encase((http: Http) => (thing: string) => {
  return http(`api/app/${thing}`);
});

await getStuff('my-thing');
```

The dependencies are only resolved at call time and are then cached and reused on subsequent calls (based on their lifecycles).

To help with testing, the returned function also has an `encased` property containng the outer function

```ts
getStuff.encased(fakeHttp)('my-thing');
```

> If you include any factoryAsync dependencies, jpex will ensure the encased function returns a promise as well.

#### jpex.extend

```ts
(config?: object): Jpex
```

creates a new container, using the current one as a base.

This is useful for creating isolated contexts or not poluting the global container.

The default behavior is to pass down all config options and factories to the new container.

##### inherit

`boolean`

Whether or not to inherit config and factories from its parent

##### lifecycle

`'application' | 'class' | 'instance' | 'none'`

The default lifecycle for factories. `class` by default

##### precedence

`'active' | 'passive'`

The default precedence for factories. `active` by default

##### optional

`boolean`

Whether factories should be optional by default

##### nodeModules

`boolean`

When trying to resolve a dependency, should it attempt to import the it from node modules?

##### globals

`boolean`

When trying to resolve a dependency, should it check for it on the global object?

#### jpex.raw

```ts
<T>() => (...deps: any[]) => T;
```

Returns the raw factory function, useful for testing.

#### jpex.clearCache

```ts
() => void
<T>() => void
```

Clears the cache of resolved factories. If you provide a type, that specific factory will be cleared, otherwise it will clear all factories.

#### jpex.infer

```ts
<T>() => string;
```

Under the hood jpex converts types into strings for runtime resolution. If you want to get that calculated string for whatever reason, you can use `jpex.infer`

### Types

#### Jpex

This is the type definition for the jpex container

#### NodeModule

This is a special type that lets you automatically inject a node module with type inference.

For example:

```ts
import jpex, { NodeModule } from 'jpex';

// this will resolve to the fs module without you having to explicitly register it as a dependency
const fs = jpex.resolve<NodeModule<'fs'>>();
```

The default return type will be `any` but you can specify one explicitly with the second type parameter:

```ts
import type fstype from 'fs';
import jpex, { NodeModule } from 'jpex';

const fs = jpex.resolve<NodeModule<'fs', typeof fstype>>();
```

#### Global

This is another special type that lets you automatically inject a global property with type inference.

For built-in types you can do this without any helpers:

```ts
import jpex from 'jpex';

const navigator = jpex.resolve<Navigator>();
```

But for custom globals, or properties that don't have built-in types, you can use the `Global` type:

```ts
import jpex, { Global } from 'jpex';

const analytics = jpex.resolve<Global<'ga', Function>>();
```

## caveats

There are a few caveats to be aware of:

- Only named types/interfaces are supported so you can't do `jpex.factory<{}>()`
- There is not yet a concept of extending types, so if you do `interface Bah extends Foo {}` you can't then try to resolve `Foo` and expect to be given `Bah`, they are treated as 2 separate things
- The check for a jpex instance is based on the variable name, so you can't do `const jpex2 = jpex; jpex2.constant<Foo>(foo);` without explicitly adding `jpex2` to the plugin config
- Similiarly you can't do `const { factory } = jpex`

## react

Jpex is a really good fit with React as it offers a good way to inject impure effects into pure components. There is a `react-jpex` library that exposes a few hooks.

```tsx
import React from 'react';
import { useResolve } from 'react-jpex';
import { SaveData } from '../types';

const MyComponent = (props) => {
  const saveData = useResolve<SaveData>();

  const onSubmit = () => saveData(props.values);

  return (
    <div>
      <MyForm />
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};
```

And this pattern also makes it really easy to isolate a component from its side effects when writing tests:

```tsx
import { Provider } from 'react-jpex';
// create a stub for the SaveData dependency
const saveData = stub();

render(
  <Provider
    inherit={false}
    // register our stub dependency on an isolated container
    onMount={(jpex) => jpex.constant<SaveData>(saveData)}
  >
    {/* when we render MyComponent, it will be given our stubbed dependency */}
    <MyComponent />
  </Provider>,
);

// trigger the compnent's onClick
doOnClick();

expect(saveData.called).to.be.true;
```

## Vanilla JS mode

Perhaps you hate typescript, or babel, or both. Or perhaps you don't have the luxury of a build pipeline in your application. That's fine because jpex supports vanilla js as well, you just have to explicitly state your dependencies up front:

```ts
const { jpex } = require('jpex');

jpex.constant('foo', 'foo');
jpex.factory('bah', ['foo'], (foo) => foo + 'bah');

const value = jpex.resolve('bah');
```

Jpex uses language features supported by the latest browsers, but if you need to support IE11 et al. you can import from 'jpex/dist/es5` (or create an alias in your build process)

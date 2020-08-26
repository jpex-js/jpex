
![Jpex](https://jpex-js.github.io/dist/jpex.svg)
===========
Easy Dependency Injection
--------------------------

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
  - [babel](#babel)
- [caveats](#caveats)
- [react](#react)
- [Vanilla JS mode](#vanilla-js-mode)

## Getting Started

### Install
```
npm install jpex
```

### Babel Plugin
Jpex uses a babel plugin to infer type interfaces. Your babel config should look something like this:
```js
{
  presets: [ '@babel/preset-typescript' ],
  plugins: [ 'jpex/babel-plugin' ]
}
```

### Usage
```ts
import jpex from 'jpex';
import { IFoo, IBah } from './types';

jpex.factory<IFoo>((bah: IBah) => bah.baz);

const foo = jpex.resolve<IFoo>();
```

------

## Registering Dependencies
Services and factories are small modules or functions that provide a reusable or common piece of functionality.

### factories
```ts
type MyFactory = {};

jpex.factory<MyFactory>(() => {
  return {};
});
```

### services
```ts
type MyService = { method: () => any };

jpex.service<MyService>(function(){
  this.method = function(){
    ...
  };
});
```

### constants
```ts
type MyConstant = string;
jpex.constant<MyConstant>('foo');
```

------

## Consuming Dependencies
### resolve
You can then resolve a dependency anywhere in your app:
```ts
const value = jpex.resolve<MyFactory>();
```

### dependent factories
You can also request a dependency from within another factory:
```ts
jpex.constant<MyConstant>('foo');

jpex.factory<MyFactory>((myConstant: MyConstant) => {
  return `my constant is ${myConstant}`;
});
```

### encase
Or you can *encase* a function so that dependencies are injected into it on-the-fly:
```ts
const myFn = jpex.encase((value: MyFactory) => (arg1, arg2) => {
  return value + arg1 + arg2;
});
```

-------

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

The following options can be provided for both factories and services:

##### lifecycle
```ts
'application' | 'class' | 'instance' | 'none'
```
Determines how long the factory is cached for once resolved.

- `application` is resolved forever across all containers
- `class` is resolved for the current jpex container, if you `.extend()` the new container will resolve it again
- `instance` if you request the same dependency multiple times in the same `resolve` call, this will use the same value, but the next time you call `resolve` it will start again
- `none` never caches anything

The default lifecycle is `class`

##### precedence
```ts
'active' | 'passive'
```
Determines the behavior when the same factory is registered multiple times.

- `active` overwrites the existing factory
- `passive` prefers the existing factory

Defaults to `active`

##### bindToInstance
```ts
boolean
```
Specifically for services, automatically binds all of the dependencies to the service instance.

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

jpex.service<Foo>(Foo);
```

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
boolean
```
When `true` if the dependency cannot be found or resolved, it will just return `undefined` rather than throwing an error.

##### with
```ts
object
```
Lets you pass in static values to use when resolving dependencies. This should be used as an escape hatch, as `resolveWith` was created specifically for this purpose.

#### jpex.resolveWith
```ts
<T, ...Rest[]>(values: Rest, opts?: object): T
```
Resolves a factory while substituting dependencies for the given values

```ts
const foo = jpex.resolveWith<Foo, Bah, Baz>([ 'bah', 'baz' ]);
```

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

To help with testing, the returned function also has an `encased` property containng the outer function

```ts
getStuff.encased(fakeHttp)('my-thing');
```

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

When trying to resolve a tdependency, should it attempt to import the dependency from node modules?

##### globals
`boolean`

When trying to resolve a dependency, should it check for it on the global object?

#### jpex.raw
```ts
<T>() => (...deps: any[]) => T
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
<T>() => string
```

Under the hood jpex converts types into strings for runtime resolution. If you want to get that calculated string for whatever reason, you can use `jpex.infer`

### babel
#### identifier
```ts
string | string[]
```
The variable name of your `jpex` instance that the babel plugin should look for. By default it is just `jpex`.

For example in your app you may have something like:

```ts
const ioc = jpex.extend();

ioc.factory<Foo>(fooFn);
```

Then you should set the identifier property to `'ioc'` or `[ 'ioc', 'jpex' ]`

#### publicPath
```ts
string | boolean
```
The default behavior when creating string literals for types is to use the file path + the type name.

For example, if you import `MyDep` from `'src/types/common'`, jpex will name it `type:/src/types/common/MyDep`.

However, sometimes this is not ideal, such as when creating a node module package. (When you import a type from a node module, jpex will just use the package name as the file path)

`publicPath` allows you to set the path prefix. For example, setting it to `myPackageName` would result in a naming scheme of `type:/myPackageName/MyDep`.

If you set `publicPath` to `true`, it will attempt to load your `package.json` and read the `name` property.

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
      <MyForm/>
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};
```

And this pattern also makes it really easy to isolate a component from its side effects when writing tests:

```tsx
import { Provider, useJpex } from 'jpex';
// create a stub for the SaveData dependency
const saveData = stub();

render(
  // the Provider component will create a new jpex instance
  <Provider>
    {() => {
      // grab jpex - it will be isolated to this context only
      const jpex = useJpex();
      // register our stub dependency
      jpex.constant<SaveData>(saveData);

      // when we render MyComponent, it will be given our stubbed dependency
      return (<MyComponent/>);
    }}
  </Provider>
);

// trigger the compnent's onClick
doOnClick();

expect(saveData.called).to.be.true;
```

## Vanilla JS mode
Perhaps you hate typescript, or babel, or both. Or perhaps you don't have the luxury of a build pipeline in your application. That's fine because jpex supports vanilla js as well, you just have to explicitly state your dependencies up front:

```ts
jpex.constant('foo', 'foo');
jpex.factory('bah', [ 'foo' ], (foo) => foo + 'bah');

const value = jpex.resolve('bah');
```


![Jpex](https://jpex-js.github.io/dist/jpex.svg)
===========
Easy Dependency Injection
--------------------------

[![Build Status](https://travis-ci.org/jpex-js/jpex.svg?branch=master)](https://travis-ci.org/jackmellis/jpex)
[![npm version](https://badge.fury.io/js/jpex.svg)](https://badge.fury.io/js/jpex)
[![Code Climate](https://codeclimate.com/github/jackmellis/jpex/badges/gpa.svg)](https://codeclimate.com/github/jackmellis/jpex)
[![Test Coverage](https://codeclimate.com/github/jackmellis/jpex/badges/coverage.svg)](https://codeclimate.com/github/jackmellis/jpex/coverage)

Jpex is an Inversion of Control framework.

## Getting Started

### Install
```
npm install jpex
```

### Usage
```ts
import jpex from 'jpex';
import { IFoo, IBah } from './types';

jpex.factory<IFoo>((bah: IBah) => bah.baz);

const foo = jpex.resolve<IFoo>();
```

------

### Registering Dependencies
Services and factories are small modules or functions that provide a reusable or common piece of functionality. In Jpex, you can register **factories**:
```ts
jpex.factory('myFactory', () => {
  return {};
});
```
**services**:
```ts
jpex.service('myService', function(){
  this.method = function(){
    ...
  };
});
```
and **constants**:
```ts
jpex.constant('myConstant', 'foo');
```

If you're using typescript you can use type inference to automatically register factories:
```ts
jpex.factory<MyFactory>(() => {
  return {};
});
```
```ts
jpex.service<IMyService>(class MyService implements IMyService {
  method() {}
});
```
```ts
type MyConstant = string;

jpex.constant<MyConstant>('foo');
```

------

### Consuming Dependencies
```ts
const myFactory = jpex.resolve('myFactory');
```

You can also request a dependency from within another factory:
```ts
jpex.constant('myConstant', 'foo');

jpex.factory('myFactory', (myConstant) => {
  return {
    injectedValue : myConstant
  };
});

jpex.service('myService', function(myFactory){
  this.method = function(){
    return myFactory.injectedValue;
  };
});

jpex.resolve('myService').method(); // returns 'foo'!
```

Again, with typescript you can use types to automatically pull in your dependencies:
```ts
jpex.factory<MyFactory>((myConstant: MyConstant) => {
  return {
    injectedValue: myConstant,
  };
});

jpex.service<MyService>(function(myFactory: MyFactory) {
  this.method = function(){
    return myFactory.injectedValue;
  };
});

jpex.resolve<MyService>().method();
```

-------

## Babel
In order to use the inferred typescript functionality, you need to run your code through babel using the plugin in this package. You can import it from `jpex/babel-plugin`

```js
plugins: [ 'jpex/babel-plugin' ]
```
By default it only checks for an object named `jpex`. If you decide to rename it to anything else, or have multiple containers, you can pass an identifier option in:
```js
plugins: [ [ 'jpex/babel-plugin', { identifier: [ 'jpex', 'ioc' ] } ] ]
```

There are a number of caveats to this method, however:
- The plugin only supports named types so you can't do `jpex.factory<{}>()`
- There is not yet a concept of extending types, so if you do `interface Bah extends Foo {}` you can't then try to resolve `Foo` and expect to be given `Bah`, they are treated as 2 separate things
- Registering a dependency inside a node_module or in an aliased import will likely not work

This is still a work in progress so hopefully more in depth type inferrence will be added in the future.

For more information, see the full documentation at [https://jpex-js.github.io](https://jpex-js.github.io)

## API
### jpex
#### jpex.constant
```ts
jpex.constant(name: string, obj: any)
jpex.constant<T>(obj: T)
```
Registers a constant value

#### jpex.factory
```ts
jpex.factory(name: string, deps?: string[], fn: (...deps: any[]) => any)
jpex.factory<T>(fn(...deps: any[]) => T)
```
Registers a factory function.

#### jpex.service
```ts
jpex.service(name: string, deps?: string[], c: ClassType)
jpex.service<T>(c: ClassType<T>)
```
Registers a service, the dependencies will be passed in to the constructor function. It is possible to pass in a regular function instead of an ES6 class.

##### .lifecycle
```ts
jpex.factory(...args).lifecycle.application();
jpex.factory(...args).lifecycle.class();
jpex.factory(...args).lifecycle.instance();
jpex.factory(...args).lifecycle.none();
```
sets the lifecycle of the factory. This determines how long a resolved factory is cached for.

- Application is forever
- Class is for the entire container (creating a new container via `jpex.extend` will require the factory to be resolved again)
- Instance will cache the dependency through a single "call" (i.e. if multiple nested dependencies rely on the same factory). But each separate call will re-resolve
- None never caches

##### .bindToInstance
```ts
jpex.service(...args).bindToInstance();
```
Automatically binds dependencies to a service's instance.

##### .dependencies
```ts
jpex.factory(...args).dependencies('foo', 'bah');
```
Allows you to set a factory's dependencies after-the-fact.

#### jpex.alias
```ts
jpex.alias(alias: string, factory: string): void
jpex.alias<T>(alias: string): void
```
#### jpex.resolve
```ts
jpex.resolve<T>(name: string): T
jpex.resolve<T>(): T
```
Resolves a specified dependency. You can omit the `name` parameter if using the babel plugin

#### jpex.resolveWith
```ts
jpex.resolveWith<T>(name: string, namedParameters: object): T
jpex.resolveWith<T>(namedParameters: object): T
```
allows you to pass in values for specific dependencies. Rather than attempting to resolve those dependencies, it will use the given value instead.

```ts
jpex.constant('myConstant', 'foo');
jpex.factory('myFactory', [ 'myConstant' ], (c) => c);

const x = jpex.resolveWith('myFactory', { myConstant: 'bah' });

// x -> bah
```

#### jpex.encase
```ts
jpex.encase(
  dependencies: string[],
  fn: (...deps: any[]) => Function
): Function
jpex.encase(
  fn: (...deps: any[]) => Function
) => Function
```
Wraps a function and injects values into it, it then returns the inner function for use. It supports type inference.

The easiest way to explain this method is with an example:

```ts
const getStuff = jpex.encase((http: Http) => (thing: string) => {
  return http(`api/app/${thing}`);
});

await getStuff('my-thing');
```

##### .encased
For testing purposes, you can access the wrapper function of your encased method using this property.
```ts
getStuff.encased(fakeHttp)('my-thing');
```

#### jpex.clearCache
```ts
(name?: string | string[]): void
```
Clears the cache. If you provide a name, it will only clear that factory's cache. If you omit name, it will clear the entire cache.

#### jpex.extend
```ts
jpex.extend(config?: {
  lifecycle?: Lifecycle,
}): Jpex
```
Creates a new container. You will still have access to all factories registered on the parent container.

#### jpex.infer
```ts
jpex.infer<T>(): string
```
If you're working with typescript inference, you can use this function to get the inferred name of a type.

```ts
const dependencyName = jpex.infer<IFactory>(); // something like src/types/IFactory
```

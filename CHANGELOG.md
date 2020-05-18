Change Log
==========
## 3.2.0
- add `jpex.raw` function for extracting a factory function
- add publicPath babel config option

## 3.1.0
- global types like `Window` and `Document` can now be used to register dependencies

## 3.0.1
- encase now caches the wrapped function for better performance
- alias is now bidirectional, so it determines which is the alias and which is the original
- default lifecycle should be inherited from the parent
- removed decorators in favour of self-invoking factories. Decorators were not intended to reach v3. You can decorate a factory from a parent container by doing `jpex.factory('foo', [ 'foo' ], (foo) => { /* decorate here */ })`

## 3.0.0
- Complete rewrite of the entire library
- Typescript support
- Jpex is no longer a class emulator as native classes have reached a pretty stable level. It should now be considered as purely a container IOC tool
- Things like `jpex.$resolve` and `jpex.$encase` have been renamed to `jpex.resolve` and `jpex.encase`. This is the tip of the iceberg in terms of changes. Jpex is no longer a constructor and can't be instantiated. `jpex.extend` no longer accepts class-related properties, etc.
- Set factory dependencies via chaining i.e. `jpex.factory('foo', fn).dependencies('bah', 'baz')`
- Available plugin hooks are exported i.e. `import jpex, { Hook } from 'jpex'`
- Alias option lets you create a dependency that returns another dependency
- Plugin functionality has been removed as 90% of its use was for intercepting class lifecycle steps
- `resolve` now only returns a single dependency and doesn't accept named parameters. For named params you must call `resolveWith`
- Type inference can now be used to register and resolve dependencies i.e. `jpex.factory<IThing>((log: ILog) => { ... })` and `jpex.resolve<IThing>()` `jpex.encase((thing: IThing) => () => { ... })` etc.
- ^ requires a babel plugin to work, which can be imported from `jpex/babel-plugin`
- You can get a concrete name of an inferred dependency using `infer`: `const name = jpex.infer<IThing>()`

## 2.1.0
- if an option in the `properties` config is null, jpex will no longer throw an error
- Passing `$options` into a `Jpex as a Service` service now works
- `Jpex.register.service().bindToInstance()` allows you to bind dependencies to a service instance
- `Jpex.$encase` method allos you to wrap a function with a number of dependencies

## 2.0.0  
### Features  
- Can now pass in a `config` option when extending a class. Any properties of the config option will be used as default values for that class and its descendants.  
- The default lifecycle for factories registered against a class can now be configured using the `defaultLifecycle` option.  
- Methods option has been added (which replaces the *prototype* option from v1).  
- Properties option has been added, allowing you to predefine getters, setters, and watchers on any instance properties.  
- the `bindToInstance` option can now accept a nested property name, i.e. `bindToInstance : 'foo.bah'`  
- Node-specific code has been isolated so the core *jpex* module can be included in any webpack/browserify build. (*see depcrecation of jpex-web below*)  
- Added a pre-compiled build of Jpex at `jpex/dist/jpex.js` and `jpex/dist/jpex.min.js`  
- Default factories (`$timeout`, `$promise`, etc.) have been separated from the core module. They now must be installed separately from the **jpex-defaults**, **jpex-node**, and **jpex-web** packages.  
- The `$resolve` method is now available as a static method on every class, so dependencies can be resolved with `Class.$resolve(name)`. This allows for **Jpex** to be used as a container rather than forcing the class instantiation pattern.  
- `$resolve` can be called with an array of dependencies to resolve instead of just one.  
- Cached factories (i.e. with a `class` or `application` lifecycle) can be cleared with `Class.$clearCache()`.  
- Added `decorators` that allow a factory to be altered before being resolved. Can be registered like normal factories i.e. `Class.register.decorator(name, fn)`  
- A complete plugin API has been created that allows plugins to hook into a number of lifecycle events.  

### Breaking Changes  
- The `prototype` option has been replaced with `methods`  
- The **jpex-web** version of Jpex has been deprecated. Instead, Jpex can be `required`'d with *webpack/browserify*, or a web-safe js file can be found at `jpex/dist/jpex.js/`  
- Internal variables have been renamed. e.g. `Class._factories` is now `Class.$$factories`.  
- Default factories (`$timeout`, `$promise`, etc.) have been separated from the core module. They now must be installed separately from the **jpex-defaults**, **jpex-node**, and **jpex-web** packages.
- After deprecating its use in v1.3.0, the `singleton` option has been removed from factory registration. `Class.register.factory(name, fn, true/false)` should now be written as `Class.register.factory(name, fn).lifecycle.application()`  
- Following depcrecation in v1.4.0, the static methods `Typeof` and `Copy` have been removed.  
- Factory registration methods have been renamed to camelCase: `Jpex.Register.Factory` becomes `Jpex.register.factory`, for example.  
- `Interfaces` have been completely removed from the module. This was an experimental feature that in the end was more overhead than it was worth.  
- A number of spurious factory types have been removed: *enum, errorType, file, folder, interface, nodeModule* - although the *nodeModule* factory type is still available via the **jpex-node** package as `Class.register.node_module`.  
- Ancestoral dependencies have been removed so depending on `["^someParentFactory"]` will no longer work. The equivalent can now be achieved with *decorators*.  

## 1.4.1  
### Bugs  
- `$copy.extend` no longer combines arrays, but instead replaces the previous array value.  
- `$timeout $immediate $interval $tick` bug fixed when attaching to a class instance.  
- Added a `clear()` method to the timer factories that clear the respective timeouts.  

## 1.4.0  
### Features  
- $typeof factory is available which returns the type of an object.  
- $copy factory allows you create a deep or shallow copy of an object, or combine multiple objects.  
- $itypeof and $icopy interfaces  
- The static methods Jpex.Typeof and Jpex.Copy have been deprecated and will be removed in a future release.  
- $resolve factory which allows lazy loading of dependencies.  
### Breaking Changes  
- Calling `Class()` is now the same as calling `new Class()` so calls like `Class.call(obj)===obj` will no longer work.  

## 1.3.1  
### Bugs  
- Fixed issues where `require`-based functions were not requiring from the correct location.  

## 1.3.0
### Features
- Interfaces functionality added  
- Registering a factory returns an object with additional option methods (currently only contains the *interface()* method)  
- It is now possible to specify the life cycle of a factory or service using the `.lifecycle.x()` syntax. Possible options are `application`, `class`, `instance`, `none`  
- Due to the introduction of life cycles, the *singleton* parameter has been deprecated.  
### Breaking Changes
- All $ factories now have interfaces (i.e. *$ipromise*). If you have overwritten a default factory that is used by another default factory, it will need to include the interface in order to work. i.e. *$fs* used to depend on *$promise* but it now depends on $ipromise.  

## 1.2.0  
### Features  
- Added detailed documentation  
- $error factory and $errorFactory factory  
- ErrorType Factory i.e. `jpex.Register.ErrorType('Custom')`  
- Ancestoral dependencies i.e. `['^$errorFactory']`  
- Deprecated jpex-fs as it is now included in the standard jpex build  

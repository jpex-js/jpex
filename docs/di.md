Dependency Injection
=====================
Overview
--------
Dependency Injection is, simply, the process of injecting dependencies into a module. In a normal nodejs module, you would use `require()` to load anything you need:
```javascript
module.exports = function(){
  var path = require('path');
  var fs = require('fs');
  var util = require('../utils');
  ...
};
```
However, this means that your code is tightly coupled and you also have to understand how all of these modules are set up, where they live in the file system, etc. It also makes your code harder to test as you're not only testing the code itself, but the modules it requires.  
Dependency Injection is a way to abstract this part of the application to a separate process. You could manually inject your dependencies like so:
```javascript
module.exports = function(path, fs, util){
  ...
};
```
and in your calling code:
```javascript
require('./myModule')(require('path'), require('fs'), require('../utils'));
```
but all you're doing is shifting the point at which you couple your dependencies. Your calling code shouldn't care what dependencies are used in your module. But similarly, your module shouldn't care where the dependencies come from or how they're constructed.  

Using Jpex, the internal resolver handles all of this for you. Any modules or factories you depend on are automatically worked out, created, and injected into your module. The module doesn't care where they come from, and the caller doesn't care what the module needs.  
```javascript
module.exports = Jpex.extend(function(path, fs, util){
  ...
});

require('./myModule')();
```

Declaring dependencies
----------------------
There are 2 ways to declare a dependency: in a dependency array, or in a constructor function:  
```javascript
Jpex.extend({dependencies:['path']});
Jpex.extend(function(path){});
```
If you declare dependencies in the constructor, Jpex uses string parsing to extract the list of dependencies. In a web-facing app, this would cause issues when files are minified, however, it is extremely uncommon for node files to be minified so it's rarely an issue to rely on this method.

Registering Factories
---------------------
There are 3 common ways to resolve a dependency:
- [Register a factory](./api/index.md#factories)
- [Load from node modules](./api/factories/node_module.md)
- [Use Jpex's predefined defaults](./api/index.md#default-factories)
```javascript
Jpex.Register('myFactory', function(){
  return;
});

var MyClass = Jpex.extend(function(myFactory, express, $log){
  myFactory // factory
  express   // loaded from node_modules
  $log      // predefined factory
});
```

Resolving Dependencies
----------------------
When you create an instance of a class it attempts to resolve all its dependencies. Jpex will attempt to resolve a dependency in this order:  

1. [Named parameters](./api/factories/named-params.md)
2. [Factories](./api/factories/factory.md) registered against the class
3. Factories registered against parent classes
4. [Predefined factories](./api/index.md#default-factories)
5. [Folders](./api/factories/folder.md) registered against the class and its parents
6. [Node modules](./api/factories/node_module.md)

If a dependency resolves to a factory that also has dependencies, these will also be resolved, and so on.  


Enhanced Features
-----------------
###Object Dependencies   
An advanced feature is the ability to pass properties into a factory from your class declaration.
In your factory you add a dependency to the special *$options* key.
You can then access the object from your factory. This means you can use a single factory for multiple  purposes.
```javascript
var MyClass = jpex.extend({
  dependencies : [{myFactory : 'bob'}, {myFactory : 'steve'}],
  constructor : function(a, b){
    a.sayHello(); // hello bob
    b.sayHello(); // hello steve
  }
});

MyClass.Register.Factory('myFactory', function($options){
  return {
    sayHello : function(){
      return 'hello ' + $options;
    }
  };
});

new MyClass();
```

###Optional Dependencies  
Dependencies can be made optional by wrapping them in underscores. Normally if a require dependency cannot be resolved, an error is thrown. If an optional dependency cannot be found, it will fail silently and return *undefined*.  
```javascript
var MyClass = jpex.extend(function(_doesNotExist_, _failsToResolve_, _doesExist_, $log){
  $log(_doesNotExist_);
  $log(_failsToResolve_);
  $log(_doesExist_);
});

MyClass.Register.Factory('failsToResolve', function(doesNotExist){
  return {};
});

MyClass.Register.Factory('doesExist', function(){
  return {};
});

new MyClass();
// undefined
// undefined
// {}
```

###Ancestoral Dependencies  
Sometimes you may want to overwrite a factory but still have a reference to the original version. Ancestoral dependencies allow you to inject a dependency defined only on parent classes. This is useful when creating a new factory that enhances the original factory.  
To make a dependency Ancesetoral, prefix the name with a ^.
```javascript
MyClass.Register.Factory('$log', ['^$log'], function($log){
  return function(message){
    $log('Enhanced message: ' + message);
  };
}, true);
```

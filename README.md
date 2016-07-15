JPEX - Javascipt Protoype Extension
===================================

What
----
Jpex is a Class wrapper and Inversion of Control framework that makes javascript more class-like and testable.


Jpex aims to solve 3 issues:  
- Proper classes - not just prototypes or ES2015's syntactic sugar, we want to have real control over class behaviour  
- Inheritence - prototypical inheritence isn't straightforward or all-encompassing, there should be an easy way to inherit properties  
- Dependency Injection

How
----
Dead easy! Just require, extend, and instantiate!  
```javascript
var jpex = require('jpex');

var MyClass = jpex(function($log){
  this.thing = 'hello';
  $log('My Class instantiated');
});

var instance = new MyClass();
```

Why
---
JavaScript has always been a mishmash of language types. It's part functional, part prototypical, part object orientated.  
I want a simple and consistent class system that offers expected OOP behaviour.  
Of course, one of the biggest advantages of Jpex is testability. With all dependencies being injected, it's really easy to unit test and mock out components, especially with the JpexMocks library.

Api
---
###Extend
The extend function creates a new class using the original as its parent and the function as a constructor. You can then extend the new class and so on.

Note that you don't have to pass arguments into the new command, these are automatically infected.

Extend can be called in 3 ways: with no parameters, with a constructor function, and with an [options](#extend-options) object:

```javascript
var MyClass1 = jpex.extend();

var MyClass2 = jpex.extend(function(myService, myFactory, $timeout){
  // Class constructor
});

var MyClass3 = jpex.extend({
  invokeParent : true,
  dependencies : ['myService', 'myFactory', '$timeout'],
  constructor : function(myService, myFactory, $timeout){
    // Class constructor
  },
  prototype : {
    someFn : function(){}
  },
  static : {
    staticProperty : {}
  }
});
```

####Extend options
#####Constructor
The constructor function that will be called when the class is instantiated.

#####dependencies
Dependencies to be resolved and injected into the constructor. If omitted, the dependencies are extracted from the constructor function Angular-style.  
Often the dependencies option isn't required, but there may be some use cases such as [object dependencies](#object-dependencies) or dependencies that are not valid parameter names.  

#####bindToInstance
If true, any dependencies that are injected into the class will be automatically attached to the instance object.
```javascript
var MyClass = jpex.extend({
  dependencies : ['fs', 'path', '$promise'],
  bindToInstance
});

var instance = new MyClass();
// instance.fs, instance.path, instance.$promise will all be set
```

#####prototype
Adds functions to the class prototype. There isn't really advantage over adding to the prototype after creating the class, except for keeping code organised. The prototype is inherited (it becomes the prototype of the child class's prototype).

#####invokeParent
*Defaults to False if there is a constructor function, or True if there isn't*  
Determines whether the parent constructor should be called before calling the class constructor. Any dependencies shared between the parent and child classes will be passed up the invocation chain, if the parent uses any different dependencies these will be resolved.  
If invokeParent is set to `'after'` the parent will be called after the main constructor.
```javascript
var ParentClass = jpex.extend(function($log){
  $log('Parent Class');
});

var ChildClass = ParentClass.extend({
  constructor : function($log){
    $log('Child Class');
  },
  invokeParent : true
});
new ChildClass();

// Console would read
// Parent Class
// Child  Class

var BabyClass = ChildClass.extend({
  constructor : function($log){
    $log('Baby Class');
  },
  invokeParent : 'after'
});

new BabyClass();

// Console would read
// Baby Class
// Parent Class
// Child Class
```

#####static
Adds static properties to the newly created class, this is the same as doing `MyClass.something = x`. Static properties are inherited.

###Register
Factories are small modules that can be injected into a class. Some are [predefined](#predefined-factories), some are user defined and some are node_modules.

####Injecting dependencies
Dependencies are declared in the class's [constructor](#constructor) function. When you create an instance of a class it attempts to resolve all its dependencies. There is a specific order of precendence for resolving a dependency:

1. [Named parameters](#named-parameters)
2. [Factories](#factories) registered against the class
3. [Factories](#factories) registered against parent classes
4. [Predefined factories](#predefined-factories)
5. [Folders](#folder) registered against the class and its parents
6. [Node modules](#node_module)

####Factories
There are a number of different factory types but they are all essentially just variations of the Factory type.
#####Factory
*(Name, Dependencies, Function, Singleton)*  
These are functions that return an object that is then injected into the class instance. Think angular Factories.  
You can also optionally specify whether the class is a singleton, i.e whether a new objected is created every time or just once for the application. By default this is false, so a new object is returned every time.  
Factories are inherited so you can register a Factory on a parent class and use it in a child class. In fact, this is the whole idea: Factories are common, reusable modules that you expect to be used by your class and its children.
```javascript
var MyClass = jpex.extend(function(myFactory){
  myFactory.doSomething();
});

MyClass.Register.Factory('myFactory', function($log){
  return {
    doSomething : function(){
      $log('Do Something!');
    }
  };
});

new MyClass();
```

#####Service
*(Name, Deps, Fn, Singleton)*
Fn is an instantiatable function. Services are similar to angular services except that they are not singletons by default.
```javascript
var MyClass = jpex.extend(function(myService){
  myService.doSomething();
});

MyClass.Register.Service('myService', function($log){
  this.doSomething = function(){
      $log('Do Something!');
  };
});

new MyClass();
```

#####Constant
*(Name, Value)*
Returns a constant value. This is useful for passing a static object into classes, such as a database connection.
```javascript
var MyClass = jpex.extend(function(db){
  db.retrieveSomeStuff();
});
MyClass.Register.Constant('db', returnDatabaseObjectFromSomewhere());

new MyClass();
```

#####Enum
*(Name, Value)*
Pass in an array of strings and it creates an enumeration object with properties, the values of which are a 0-based value. Once registered, the resulting enum is frozen, meaning the injected value cannot be amended.
```javascript
var MyClass = jpex.extend(function(myEnum, $log){
  $log(myEnum.Apple);
  $log(myEnum.Banana);
});

MyClass.Register.Enum('myEnum', ['Apple', 'Banana']);

new MyClass();
// 0
// 1
```

#####File
*(Name, Path)*
This will attempt to require the provided path when injected. Once loaded, the result is returned as is, there is no additional processing, just the object in the file.
```javascript
var MyClass = jpex.extend(function(file1, file2, file3){
  file1.doSomething();
  file2.sameAsFile1();
  file3.isJson;
});

MyClass.Register.File('file1', 'files/jsfile');
MyClass.Register.File('file2', 'files/jsfile.js');
MyClass.Register.File('file3', 'files/jsonfile.json');

new MyClass();
```

#####Folder
*(Path)*
If a dependency can't be found in the registered factories, it will attempt to find the dependency on any registered folders.
This can be an expensive process so should be avoided if possible. Once the dependency has been found in a folder, the resulting location will be cached.
```javascript
var MyClass = jpex.extend(function(jsfile, jsonfile){
  file1.doSomething();
  file3.isJson;
});

MyClass.Register.Folder('files');

new MyClass();
```

#####Node_module
*(name)*
If all of the above fail, it will attempt to load the dependency from node_modules. This includes anything in the node_modules folder and global modiles like fs and path.  
To avoid the overhead of checking all factories and folders before resorting to this method, you can manually register a node_module.
```javascript
var MyClass = jpex.extend(function(fs, path){
  path.resolve('/');
  fs.readFile();
});

MyClass.Register.node_module('fs');

new MyClass();
```

####Named Parameters
Named parameters take precedence over anything else and are essential to quickly mocking out dependencies in unit tests.  
When instantiating a class, you can provide a single object parameter with any dependencies.
```javascript
var MyClass = jpex.extend(function(custom, fs){
  custom('string');
});

new MyClass({
  custom : function(val){}
});
```
Named parameters are especially useful for unit testing, as you can quickly create a mock dependency that will replace an existing factory.

####Predefined factories
There are a handful of predefined factories that wrap up common functions such as `setTimeout`. Although you can continue using the non-injected functions, the injected versions mean you can easily mock out their behaviour in unit tests. The JpexMocks library automatically mocks out all of these for you.

#####$timeout, $interval, $immediate, $tick
These are just wrappers for the `setTimeout`, `setInterval`, `setImmediate`, and `process.nextTick` functions.
```javascript
var MyClass = jpex.extend(function($timeout, $interval, $immediate, $tick){
  $timeout(function(){}, 250);
  $interval(function(){}, 250);
  $immediate(function(){});
  $tick(function(){});
});

new MyClass();
```

#####$log
This is a wrapper for the console functions
```javascript
var MyClass = jpex.extend(function($log){
  $log('I am console.log');
  $log.log('I am also console.log');
  $log.warn('I am console.warn');
  $log.error('I am console.error');
});

new MyClass();
```

#####$promise
This wraps up the native `Promise` class, without the need for the new keyword.
```javascript
var MyClass = jpex.extend(function($promise){
  $promise(function(resolve, reject){
    resolve();
  });
  $promise.resolve();
  $promise.reject();
  $promise.all([]);
  $promise.race([]);
});

new MyClass();
```

###Other features
There are a number of properties that get added to every class you extend that perform some useful functionality:

####NamedParameters
*(arguments)*  
This will take an array of values that correspond to the class's dependencies and returns an object with key value pairs.
```javascript
var MyClass = jpex.extend(function(myFactory, myService){
  var namedParameters = MyClass.NamedParameters(arguments);
  namedParameters.myFactory === myFactory; // true
});

new MyClass();
```

####InvokeParent
*(instance, arguments, namedParameters)*  
Although you can automatically [invoke the parent](#invokeparent), it's also possible to invoke it manually. The third argument allows you to inject custom parameters into the parent
```javascript
var MyClass = jpex.extend(function(myFactory, myService){
  MyClass.invokeParent(this, arguments, {someDependency : 'foo'});
});

new MyClass();
```

####Copy
*(obj)*  
This function performs a deep copy of any object
```javascript
var obj = {str : 'a', num : 3, obj : {}, arr : [], reg : /abc/};
var copy = jpex.Copy(obj);
```

####Type of
*(obj)*  
This is an extension of the native type of statement. However, unlike the native version it can differentiate between objects, dates, arrays, regular expressions, and null objects
```javascript
jpex.Typeof('str'); // 'string'
jpex.Typeof(123); // 'number'
jpex.Typeof({}); // 'object'
jpex.Typeof([]); // 'array'
jpex.Typeof(); // 'undefined'
jpex.Typeof(null); // 'null'
jpex.Typeof(/abc/); // 'regexp'
jpex.Typeof(new Date()); // 'date'
```

####Object Dependencies
An advanced feature is the ability to pass properties into a factory from your class declaration.
In your factory you then add a dependency to the special *$options* key.
You can then access the object from your factory. This means you can use a single factory for multiple  purposes.
```javascript
var MyClass = jpex.extend({
  dependencies : [{myFactory : 'bob'}, {myFactory : 'steve'}],
  constructor : function(a, b){
    a.sayHello(); // hello bob
    a.sayHello(); // hello steve
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
This also works with services.
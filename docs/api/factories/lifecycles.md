Life Cycles
===========
The life cycle of a factory determines how often a new instance is created.

*Life cycles replace the singleton parameter of factories which has now been deprecated. `Factory(n, fn, true)` should now be written as `Factory(n, fn).lifecycle.application()`.*  

application
-----------
This option means that after the first time a facory has been created, the same instance will be used throughout the entire application.
```javascript
var MyClass = Jpex.extend(function(myFactory){...});

MyClass.Register.Factory('myFactory', function(){...}).lifecycle.application();

new MyClass(); // will create an instance of myFactory
new MyClass(); // will reuse the same instance

var SubClass = MyClsss.extend();

new SubClass(); // will also reuse the same instance
```

Keep in mind that an application lifecycle does not mean the factory is global. It is only accesable relative to where it was registered.
```javascript
var ClassA = Jpex.extend(function(myFactory){...});
var ClassB = Jpex.extend(function(myFactory){...});

ClassA.Register.Factory('myFactory', function(){...}).lifecycle.application();

new ClassA(); // creates an instance of myFactory
new ClassB(); // myFactory is not accessable to ClassB as they are on a different heirarchy tree
```

It is also important to keep in mind that if an application-level factory depends on another factory, it will only calculate the dependency once.
```javascript
var MasterClass = Jpex.extend();
MasterClass.Register.Constant('myConstant', 'master');
MasterClass.Register.Factory('myFactory', function(myConstant){return myConstants;});

var ClassA = MasterClass.extend(function(myFactory){});
ClassA.Register.Constant('myConstant', 'A');

var ClassB = MasterClass.extend(function(myFactory){});
ClassB.Register.Constant('myConstant', 'B');

// The first class to get instantiated will determine what myFactory will resolve to...
new ClassA(); // 'A'
new ClassB(); // 'A'
new Master(); // 'A'
```

And finally, if you re-declare a factory in a child class, this will be used instead of the original.
```javascript
var MyClass = Jpex.extend(function(myFactory){...});

MyClass.Register.Factory('myFactory', function(){...}).lifecycle.application();

new MyClass(); // will create an instance of myFactory

var SubClass = MyClsss.extend();
SubClass.Register.Factory('myFactory', function(){...});

new SubClass(); // will use its own declaration of myFactory
```

class
-----
For a class-level life cycle, the same factory instance will be used every time you create a new class instance. However, if you create a child class, it will use a different instance of the factory.
```javascript
var MyClass = Jpex.extend(function(myFactory){...});

MyClass.Register.Factory('myFactory', function(){...}).lifecycle.class();

new MyClass(); // will create an instance of myFactory
new MyClass(); // will reuse the same instance

var SubClass = MyClsss.extend();

new SubClass(); // will create another instance of myFactory
new SubClass(); // will reuse the same instance
```

instance
--------
This will create a new factory instance every time you instantiate a class.
```javascript
var MyClass = Jpex.extend(function(myFactory){...});

MyClass.Register.Factory('myFactory', function(){...}).lifecycle.instance();

new MyClass(); // will create an instance of myFactory
new MyClass(); // will create another instance of myFactory
```
However, unlike *none*, it will use the instance to resolve all of the class instance's factories.
```javascript
var MyClass = Jpex.extend(function(a, b, c){...});

MyClass.Register.Factory('myFactory', function(){...}).lifecycle.instance();
MyClass.Register.Factory('a', function(myFactory){return myFactory;})
MyClass.Register.Factory('b', function(myFactory){return myFactory;})
MyClass.Register.Factory('c', function(myFactory){return myFactory;})

new MyClass(); //a b and c will all be the same instance of myFactory
```

none
----
This will create a new factory instance every time it is requested.
```javascript

var MyClass = Jpex.extend(function(a, b, c){...});

MyClass.Register.Factory('myFactory', function(){...}).lifecycle.none();
MyClass.Register.Factory('a', function(myFactory){return myFactory;})
MyClass.Register.Factory('b', function(myFactory){return myFactory;})
MyClass.Register.Factory('c', function(myFactory){return myFactory;})

new MyClass(); //a b and c will all be different instances of myFactory
new MyClass(); // this will create another 3 instances of myFactory
```
Note that if you invoke the class's parent, it *will* share the same factory instance with it.
Interfaces
==========

Interfaces are a sort of contract for your dependencies. It defines how how a module should be structured and what properties and methods it should have.  
Any factories that implement an interfacr must adhere to the interface's pattern. This means that you can guarentee that a dependency will always have certian methods available.  
If a factory does not match the interface when resolved, an error is thrown describing the properties that must be addressed.  

```javascript
var MyClass = Jpex.extend(function(iFactory){...});
var ChildClass = MyClass.extend(function(iFactory){...})

MyClass.Register.Interface('iFactory', function(i){ return {a : i.string, b : i.number, c : i.array};});

MyClass.Register.Service('myFactory', function(){
  this.a = 'string';
  this.b = 4;
  this.c = [];
}, 'iFactory');

// When ChildClass overrides this factory, if it does not have the same format it will throw an error
ChildClass.Register.Factory('myFactory', function(){
  return {};
}, 'iFactory');

new MyClass(); // okay
new ChildClass(); // error - myFactory does not match interface pattern.
```

Implementing Interfaces
-----------------------
When registering a factory you can set which interfaces it implements.
```javascript
MyClass.Register.Factory('myFactory', function(){...}, 'iService', true);
```
Then when you want to inject your factory you can use the interface to find, validate, and inject the factory.
```javascript
var ChildClass = MyClass.extend(function(iService){...});
```
You can still inject the factory directly and it will ignore the interface validation.
```javascript
var ChildClass = MyClass.extend(function(myFactory){...});
```


Declaring with Named Parameters
-------------------------------

Jpex Class Interfaces
---------------------
When you declare a class, you can optionally provide an *Interface* option. This doesn't do anything on its own, but if you register a class as a service for another class, it will use this property to determine what the class implements.
```javascript
var ServiceClass = Jpex.extend({
  interface : 'iService'
});

MyClass.Register.Service('myService', ServiceClass);

MyClass.Register.Factory('usesMyService', function(iService){...});
```
Alternatively you can still provide your own interface options to the `Service` function:
```javascript
MyClass.Register.Service('myService', ServiceClass, 'iService');
```

Interface Derivitives
---------------------
As you can *nest* interfaces, you may have a factory that implements a higher-order interface than what you want. The factory will still be valid as its interface implements the requested interface.
```javascript
MyClass.Register.Interface('IEnumerable', function(i){return i.array;});
MyClass.Register.Interface('IList', function(i){
  var arr = [];
  arr.Add = i.function;
  arr.Remove = i.function;
}, 'IEnumerable');

MyClass.Register.Factory('List', function(){
  var arr = [];
  arr.Add = function(){...};
  arr.Remove = function(){...};
}, 'IList');

MyClass.Register.Factory('lister', function(IEnumerable){...});
```
Because the *List* factory implements *IList*, it is implied that it must also implement *IEnumerable*, so if you inject IEnumerable into your class, it will decide that *List* is an acceptable implementer. It will validate that *List* implements *IEnumerable*, but it will not check that it implements *IList* because it is not interested in any features beyond what *IEnumerable* exposes.

Notes / Caveats
---------------
Javascript is neither a compiled nor a typed language, so interfaces are not a natural or easy fit. Jpex works just fine without interfaces so what is the benifit of wedging them into the framework?  
- Maintainability

   With interfaces it is easy to interchange dependencies. The implementation of a logging service can quickly be swapped with another and you can guarantee that the same methods will be available. You may also have different factories depending on the environment etc.
   
- Decoupling

   It's good practice not to tightly couple your application. This is what Jpex is all about. Although it may seem trivial to use iMyService instead of myService, it means you are putting an extra step between the implementation and the caller.
   
- Unit Testing

  This is a huge plus for using interfaces. The jpexmocks library in particular has methods for completely mocking out a factory or class based on the interface it implements, meaning you can unit test a class or module without having to manually create a mock version of every dependency it uses.
   
If there are multiple factories that implement the same interface, the Dependency Injection process has to guess which one to use. It will use the factory closest to the class that's being instantiated. It is often better to have many interfaces than a few generic ones as this will ensure that the correct factory gets picked up.


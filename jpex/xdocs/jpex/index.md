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

var MyClass = jpex.extend(function($log){
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

Install
-------
Jpex can be installed using npm:
```
npm install jpex --save
```

Dependency Injection
--------------------

Api
----
###Jpex Methods###  
There are a number of properties that get added to every class you extend that perform some useful functionality:
Extend
Register


###Default Factories###  
Jpex comes with a few injectable factories out of the box. These should make your application more flexible and easier to test.


###Other features###

####Object Dependencies
An advanced feature is the ability to pass properties into a factory from your class declaration.
In your factory you then add a dependency to the special *$options* key.
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
This also works with services.  

####Optional Dependencies  
Dependencies can be made optional by wrapping them in underscores. Normally if a require dependency cannot be resolved, an error is thrown. If an optional dependency can't be found, it will fail silently and return undefined.  
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
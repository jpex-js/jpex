JPEX - Javascipt Protoype Extension
===================================

Factory
--------
*(Name, Dependencies, Function, Singleton)*  
These are functions that return an object that is then injected into the class instance. Think angular Factories.  
You can also optionally specify whether the class is a singleton, i.e whether a new objected is created every time or just once for the application. By default this is false, so a new object is returned every time.  
Factories are inherited so you can register a factory on a parent class and use it in a child class. In fact, this is the whole idea: Factories are common, reusable modules that you expect to be used by your class and its children.
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
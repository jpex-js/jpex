JPEX - Javascipt Protoype Extension
===================================

Service
-------
*(Name, Deps, Fn, Singleton)*
Fn is an instantiatable function. Services are similar to angular services except that they are not singletons by default.  
It is also possible to register another jpex class as a service.
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
JPEX - Javascipt Protoype Extension
===================================

$promise
--------
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
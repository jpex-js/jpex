$promise
========
This wraps up the native `Promise` class, without the need for the `new` keyword.

$promise
--------
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| function      | Function      |           |
Calling $promise will create a new Promise with the provided constructor function.  
The function takes two parameters: resolve and reject.
```javascript
return $promise(function(resolve, reject){
  resolve(123);
});
```

$promise.resolve
----------------
Returns a resolved promise.
```javascript
return $promise.resolve(123);
```

$promise.reject
---------------
Returns a rejected promise.
```javascript
return $promise.reject().catch(...);
```

$promise.all
------------
Accepts an array of promises and resolves once all promises have been resolved.
```javascript
$promise.all([$promise(...), $promise.resolve(), 123]);
```

$promise.race
-------------
Accepts an array of promises and resolves when any of the promises has been resolved.
```javascript
$promise.race([$promise(...), $promise.resolve(), 123]);
```
JPEX - Javascipt Protoype Extension
===================================

timeout, $interval, $immediate, $tick
--------------------------------------
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
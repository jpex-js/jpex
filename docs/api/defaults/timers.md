$timers
=======
These are just wrappers for the `setTimeout`, `setInterval`, `setImmediate`, and `process.nextTick` functions.

$timeout
--------
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Callback      | Function      |           |
| Timeout       | Integer       | 0         |  
$timeout is the equivalent of the setTimeout function. The callback function is called after the value of Timeout has passed. The callback function is only called once.

$interval
---------
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Callback      | Function      |           |
| Interval      | Integer       | 0         |  
$interval is the equivalent of the setInterval function. $interval is like $timeout except that the callback function is called repeatedly.

$immediate
----------
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Callback      | Function      |           |  
$immediate calls the callback function on the next available event loop. Unlike $tick, $immediate will not block IO operations.

$tick
-----
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Callback      | Function      |           |
$tick calls the callback on the next tick. This will block IO operations until the following event loop.


```javascript
var MyClass = jpex.extend(function($timeout, $interval, $immediate, $tick){
  $timeout(function(){}, 250);
  $interval(function(){}, 250);
  $immediate(function(){});
  $tick(function(){});
});

new MyClass();
```
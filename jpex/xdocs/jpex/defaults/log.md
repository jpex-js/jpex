JPEX - Javascipt Protoype Extension
===================================

$log
-----
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
JPEX - Javascipt Protoype Extension
===================================

Named Parameters
----------------
Named parameters take precedence over anything else and are essential to quickly mocking out dependencies in unit tests.  
When instantiating a class, you can provide a single object parameter with any dependencies.
```javascript
var MyClass = jpex.extend(function(custom, fs){
  custom('string');
});

new MyClass({
  custom : function(val){}
});
```
Named parameters are especially useful for unit testing, as you can quickly create a mock dependency that will replace an existing factory.
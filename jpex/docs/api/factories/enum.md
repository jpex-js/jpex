JPEX - Javascipt Protoype Extension
===================================

Enum
-----
*(Name, Value)*
Pass in an array of strings and it creates an enumeration object with properties, the values of which are a 0-based value. Once registered, the resulting enum is frozen, meaning the injected value cannot be amended.
```javascript
var MyClass = jpex.extend(function(myEnum, $log){
  $log(myEnum.Apple);
  $log(myEnum.Banana);
});

MyClass.Register.Enum('myEnum', ['Apple', 'Banana']);

new MyClass();
// 0
// 1
```
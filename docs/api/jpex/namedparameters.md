Jpex.NamedParameters
===============
*(arguments)*  
This will take an array of values that correspond to the class's dependencies and returns an object with key value pairs.  
Essentially this reconstructs your class's dependencies into an object.  
The values in the arguments array must be in the same order as the dependencies declared for the class. The normal usage would be to pass in the `arguments` keyword in your class's constructor method.
```javascript
var MyClass = jpex.extend(function(myFactory, myService){
  var namedParameters = MyClass.NamedParameters(arguments);
  // returns {myFactory : ..., myService : ...};
});

new MyClass();
```
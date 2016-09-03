###Other features
There are a number of properties that get added to every class you extend that perform some useful functionality:

####NamedParameters
*(arguments)*  
This will take an array of values that correspond to the class's dependencies and returns an object with key value pairs.
```javascript
var MyClass = jpex.extend(function(myFactory, myService){
  var namedParameters = MyClass.NamedParameters(arguments);
  namedParameters.myFactory === myFactory; // true
});

new MyClass();
```

####InvokeParent
*(instance, arguments, namedParameters)*  
Although you can automatically [invoke the parent](#invokeparent), it's also possible to invoke it manually. The third argument allows you to inject custom parameters into the parent
```javascript
var MyClass = jpex.extend(function(myFactory, myService){
  MyClass.invokeParent(this, arguments, {someDependency : 'foo'});
});

new MyClass();
```

####Copy
*(obj)*  
This function performs a deep copy of any object
```javascript
var obj = {str : 'a', num : 3, obj : {}, arr : [], reg : /abc/};
var copy = jpex.Copy(obj);
```

####Type of
*(obj)*  
This is an extension of the native type of statement. However, unlike the native version it can differentiate between objects, dates, arrays, regular expressions, and null objects
```javascript
jpex.Typeof('str'); // 'string'
jpex.Typeof(123); // 'number'
jpex.Typeof({}); // 'object'
jpex.Typeof([]); // 'array'
jpex.Typeof(); // 'undefined'
jpex.Typeof(null); // 'null'
jpex.Typeof(/abc/); // 'regexp'
jpex.Typeof(new Date()); // 'date'
```
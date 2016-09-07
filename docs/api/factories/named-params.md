Named Parameters
================
Named parameters take precedence over anything else and are essential to quickly mocking out dependencies in unit tests or injecting variable values such as a *request* object or the user's *session*.  
When instantiating a class, you can provide a single object with any number dependencies. If a class already has a factory defined, a named parameter of the same name will overwrite it.

```javascript
var MyClass = jpex.extend(function(custom, fs){
  custom('string');
});

new MyClass({
  custom : function(val){},
  fs : {}
});
```

Named parameters are especially useful for unit testing, as you can quickly create a mock dependency that will replace an existing factory.
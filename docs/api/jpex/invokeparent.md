Jpex.InvokeParent
============
*(instance, arguments, namedParameters)*  
Although you can automatically [invoke the parent](./extend.md#invokeparent), it's also possible to invoke it manually. The third argument allows you to inject custom parameters into the parent or overwrite one of the dependencies in *arguments*
```javascript
var MyClass = jpex.extend(function(myFactory, myService){
  MyClass.invokeParent(this, arguments, {someDependency : 'foo'});
});

new MyClass();
```
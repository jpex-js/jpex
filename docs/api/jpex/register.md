Jpex.Register
========
The Register property contains methods for registering a factory or service against a class. Once registered, the factory can be injected into the constructor of the class or any class that inherits from it.
```javascript
Jpex.Register('myFactory', function(){
  return {};
});

var ChildClass = Jpex.extend(function(myFactory){
  ...
});
```

Register contains the following methods:  
[Factory](../factories/factory.md)  
[Constant](../factories/constant.md)  
[Service](../factories/service.md)  
[File](../factories/file.md)  
[Folder](../factories/folder.md)  
[Enum](../factories/enum.md)  
[node_module](../factories/node_module.md)  

The Register function itself is just a shortcut for `Register.Factory();`
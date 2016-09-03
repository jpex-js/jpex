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
Factory
Constant
Service
File
Folder
Enum
node_module

The Register function itself is just a shortcut for Register.Factory();
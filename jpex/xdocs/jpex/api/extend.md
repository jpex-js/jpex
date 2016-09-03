JPEX - Javascipt Protoype Extension
===================================

Extend
-------
The extend function creates a new class using the original as its parent and the function as a constructor. You can then extend the new class and so on.

Note that you don't have to pass arguments into the new command, these are automatically injected.

Extend can be called in 3 ways: with no parameters, with a constructor function, and with an [options](#extend-options) object:

```javascript
var MyClass1 = jpex.extend();

var MyClass2 = jpex.extend(function(myService, myFactory, $timeout){
  // Class constructor
});

var MyClass3 = jpex.extend({
  invokeParent : true,
  dependencies : ['myService', 'myFactory', '$timeout'],
  constructor : function(myService, myFactory, $timeout){
    // Class constructor
  },
  prototype : {
    someFn : function(){}
  },
  static : {
    staticProperty : {}
  }
});
```

###Extend options
####Constructor
The constructor function that will be called when the class is instantiated.

####Dependencies
Dependencies to be resolved and injected into the constructor. If omitted, the dependencies are extracted from the constructor function Angular-style.  
Often the dependencies option isn't required, but there may be some use cases such as [object dependencies](#object-dependencies) or dependencies that are not valid parameter names.  
It is also possible to make dependencies [optional](#optional-dependencies).  

####BindToInstance  
If true, the bindToInstance option will attach all injected dependencies to the instance. If bindToInstance is a string, it will create a property of that name on the instance and attach the dependencies to that.
```javascript
var MyClass = jpex.extend({
  dependencies : ['myService'],
  bindToInstance : 'tmp'
});

var instance = new MyClass();
instance.tmp.myService;
```

####Prototype
Adds functions to the class prototype. There isn't really advantage over adding to the prototype after creating the class, except for keeping code organised. The prototype is inherited (it becomes the prototype of the child class's prototype).

####InvokeParent
*Defaults to False if there is a constructor function, or True if there isn't*  
Determines whether the parent constructor should be called before calling the class constructor. Any dependencies shared between the parent and child classes will be passed up the invocation chain, if the parent uses any different dependencies these will be resolved.  
If invokeParent is set to `'after'` the parent will be called after the main constructor.
```javascript
var ParentClass = jpex.extend(function($log){
  $log('Parent Class');
});

var ChildClass = ParentClass.extend({
  constructor : function($log){
    $log('Child Class');
  },
  invokeParent : true
});
new ChildClass();

// Console would read
// Parent Class
// Child  Class

var BabyClass = ChildClass.extend({
  constructor : function($log){
    $log('Baby Class');
  },
  invokeParent : 'after'
});

new BabyClass();

// Console would read
// Baby Class
// Parent Class
// Child Class
```

####Static
Adds static properties to the newly created class, this is the same as doing `MyClass.something = x`. Static properties are inherited.
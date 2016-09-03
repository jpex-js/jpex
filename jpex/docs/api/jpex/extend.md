Jpex.Extend
======
*Object*  
The extend function creates a new class using the original as its parent and the function as a constructor. You can then extend the new class and so on.

Note that you don't have to pass arguments into the new command, these are automatically injected.

Extend can be called in 3 ways: with no parameters, with a constructor function, and with an [options](#extend-options) object:

```javascript
var MyClass1 = jpex.extend();

var MyClass2 = MyClass1.extend(function(myService, myFactory, $timeout){
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

*Keep in mind that the constructor parameters are injected rather than passed in directly. So calling `new MyClass2(service, factory)` would not instantiate the class with those parameters. If you wanted to pass a parameters into your Class you would need to use [named parameters](./named-params') e.g. `new MyClass2({mySerivce : service, myFactory L factory})`*

Extend options
--------------

###constructor  
*function(dependency1, ...)*  
The constructor function that will be called when the class is instantiated.

###dependencies###
*Array[String | Object]*  
Dependencies to be resolved and injected into the constructor. If omitted, the dependencies are extracted from the constructor function.    
Often the dependencies option isn't required, but there may be some use cases such as [object dependencies](#object-dependencies) or dependencies that are not valid parameter names.  
It is also possible to make dependencies [optional](#optional-dependencies).  

###bindToInstance###  
*Boolean | String*
If *true*, the bindToInstance option will attach all injected dependencies to the instance (e.g. `this.$promise`). If bindToInstance is a string, it will create a property of that name on the instance and attach the dependencies to that.
```javascript
var MyClass = jpex.extend({
  dependencies : ['myService'],
  bindToInstance : 'tmp'
});

var instance = new MyClass();
instance.tmp.myService;
```

###prototype  
*Object*  
Adds functions to the class prototype. This is the same as directly adding properties to the prototype after creating the class. The prototype is inherited (it becomes the prototype of the child class's prototype).

###invokeParent
*Boolean | String*  
*Defaults to false if there is a constructor function, or true if there isn't*  
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

###Static  
Adds static properties to the newly created class, this is the same as doing `MyClass.something = x`. Static properties are inherited.
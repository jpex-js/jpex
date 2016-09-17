Factory
=======
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Dependencies  | Array[String] | null      |
| Function      | Function      |           |

These are functions that return an object that is then injected into the class instance. Think angular Factories.  
As with classes, if you omit the dependencies parameter, the dependencies are extracted from the function function. 
Factories are inherited, so you can register a factory on a parent class and use it in a child class. In fact, this is the whole idea: Factories are common, reusable modules that you expect to be used by your class and its children.
```javascript
var MyClass = jpex.extend(function(myFactory){
  myFactory.doSomething();
});

MyClass.Register.Factory('myFactory', function($log){
  return {
    doSomething : function(){
      $log('Do Something!');
    }
  };
});

new MyClass();
```

All main factories (except *Enum* and *ErrorType*) return a chainable object that allows you to specify additional options.  
####interface  
Specify which interfaces the factory implements
```javascript
MyClass.Register.Factory('myFactory', () => {}).interface('iFactory').interface(['multiple', 'interfaces']);
```

####lifecycle  
Specify the lifecycle of the factory. The lifecycle property is an object with the following methods:  
- application  
- class  
- instance  
- none  
More information can be found in the [lifecycles](./lifecycles.md) section.
```javascript
MyClass.Register.Factory('myFactory'), function(){...}).lifecycle.class();
```
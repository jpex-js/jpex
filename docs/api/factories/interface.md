Interface
=========
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Function      | Function      |           |
| Implements    | String/Array  |           |

Interfaces are a sort of contract for your dependencies. It defines how how a module should be structured and what properties and methods it should have.  
Any factories that implement an interfacr must adhere to the interface's pattern. This means that you can guarentee that a dependency will always have certian methods available.  
If a factory does not match the interface when resolved, an error is thrown describing the properties that must be addressed.  

```javascript
var MyClass = Jpex.extend(function(iFactory){...});
var ChildClass = MyClass.extend(function(iFactory){...})

MyClass.Register.Interface('iFactory', function(i){ return {a : i.string, b : i.number, c : i.array};});

MyClass.Register.Service('myFactory', function(){
  this.a = 'string';
  this.b = 4;
  this.c = [];
}, 'iFactory');

// When ChildClass overrides this factory, if it does not have the same format it will throw an error
ChildClass.Register.Factory('myFactory', function(){
  return {};
}, 'iFactory');

new MyClass(); // okay
new ChildClass(); // error - myFactory does not match interface pattern.
```

i
-
The constructor function takes a single parameter, an *interface utility* which provides a number of methods for defining your interface.  
###string  
This will define a string-type. This can also be declared using a string literal.
```javascript
MyClass.Register.Interface('foo', i => ({ a : i.string, b : ''}));
```
###number  
This will define a numeric type. This can also be declared by writing any numeric value
```javascript
MyClass.Register.Interface('foo', i => ({a : i.number, b : 2}))
```
###boolean  
This will define a boolean type. This can also be declared with a true/false
```javascript
MyClass.Register.Interface('foo', i => ({a : i.boolean, b : true}))
```
###null  
This will define a null type. This can also be declared with null
```javascript
MyClass.Register.Interface('foo', i => ({a : i.null, b : null}))
```
###function  
This will define a function type. This can also be declared by writing any function
```javascript
MyClass.Register.Interface('foo', i => ({a : i.function, b : function(){}}))
```
If you want to ensure the function has certain properties against it, you can use the `functionWith` method.  
###object  
This will define an empty object. This can also be declared using an object literal.  
```javascript
MyClass.Register.Interface('foo', i => i.object);
```
If you declare an object with properties, these will also be type checked:
```javascript
MyClass.Register.Interface('foo', i => ({
  a : {
    b : {
      c : i.string
    }
  }
}));
```
###array  
This will define an empty array. This can also be declared using an array literal. 
```javascript
MyClass.Register.Interface('foo', i => ({a : i.array, b : []}));
```
To specify the type of elements the array can hold, use the `arrayOf` method or create a single element of that type.
```javascript
MyClass.Register.Interface('foo', i => [i.number]);
```
###arrayOf  
This will define an array that must be a specific type. You can enter multiple types.
```javascript
MyClass.Register.Interface('foo' i => i.arrayOf(i.string, i.number));
```

###functionWith  
This will define a function that must also have certain properties attached to it. The parameter must be an object.
```javascript
MyClass.Register.Interface('foo' i => i.functionWith({a : i.object}));
```
###any  
This will create a property of any type as long as it is defined.
```javascript
MyClass.Register.Interface('foo' i => ({a : i.any()}));
```
###either  
This defines a property that can be of several types.
```javascript
MyClass.Register.Interface('foo' i => ({a : i.either(i.string, i.array)}));
```

Implements
----------
The implements property allows you to define another interface that this interface uses. This allows you to create an inheritence structure. When resolving an interface, all the implemented interfaces must be validated.  

Implementing Interfaces
-----------------------
When registering a factory you can set which interfaces it implements.
Then when you want to inject your factory you can use the interface to to find, validate, and inject the factory.
You can still inject the factory directly and it will ignore the interface validation.


Declaring with Named Parameters
Interface derivites (ienumerable)

named params should check if any of its values are factories that implement the interface
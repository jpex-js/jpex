Interface
=========
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Function      | Function      |           |

Interfaces are a sort of contract for your dependencies. It defines how how a module should be structured and what properties and methods it should have.  
Once you have registered an interface, the related factory must resolve to a similar object and type. If you overwrite a factory at any point, you must still provide an object with the same structure. This means that you can guarentee that a dependency will always have certian methods available.  
If a factory does not match the interface when resolved, an error is thrown describing the properties that must be addressed.  

```javascript
// Any time myFactory is registered, it must be an object with a string-type a property, a numeric-type b propety, and an array-type c property.
MyClass.Register.Interface('myFactory', function(i){ return {a : i.string, b : i.number, c : i.array};});

MyClass.Register.Service('myFactory', function(){
  this.a = 'string';
  this.b = 4;
  this.c = [];
});

// When ChildClass overrides this factory, if it does not have the same format it will throw an error
ChildClass.Register.Factory('myFactory', function(){
  return {};
});

new MyClass(); // okay
new ChildClass(); // error - myFactory does not match interface pattern.
```

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

###functionWith  
###any  
###either  
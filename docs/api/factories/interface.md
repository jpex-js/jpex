Interface
=========
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Interface     | Any           |           |

Interfaces are a sort of contract for your dependencies. It defines how how a module should be structured and what properties and methods it should have.  
Once you have registered an interface, the related factory must resolve to a similar object and type. If you overwrite a factory at any point, you must still provide an object with the same structure. This means that you can guarentee that a dependency will always have certian methods available.  
If a factory does not match the interface when resolved, an error is thrown describing the properties that must be addressed.  

```javascript
MyClass.Register.Interface('myFactory', {a : '', b : 0, c : []});
// Any time myFactory is registered, it must be an object with a string-type a property, a numeric-type b propety, and an array-type c property.

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

As you can see from the above example, the interface is defined using literal types. A string with any or no content means that property must be of type string (but the value is not important). All basic types (string, number, object, array, etc.) are accepted. The following rules apply:  
- null means that the property must exist but can be any value (including null)  
- an empty object means that the property must be an object but it does not matter what properties it contains  
- properties of an object are checked recursively  
- an empty array means the property must an array type but it does not matter what type its contents are  
- a non-empty array means that the property must be an array and all of the elements must be of the same type of the first element of the non-empty array
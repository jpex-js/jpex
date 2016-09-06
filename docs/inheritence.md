Inheritence
===========
Jpex supports class inheritence via the [extend](./api/jpex/extend.md) function. This method is avaialble on all classes that inherit from Jpex and the result is a new class. Classes can be extended any number of times and support javascript's `instanceof` property.  
```javascript
var ClassA = Jpex.extend();
var ClassB = ClassA.extend();
var ClassC = ClassA.extend();

ClassA instanceof Jpex    // true

ClassB instanceof ClassA  // true
ClassB instanceof Jpex    // true

ClassC instanceof ClassA  // true
ClassC instanceof Jpex    // true
ClassC instanceof ClassB  // false
```

Each time you extend from a class, any [static](./api/jpex/extend.md#static) properties are inherited as well as any methods attached to the [prototype](./api/jpex/extend.md#prototype).  
[Factories](./api/index.md#default-factories) are also inherited. When a dependency is resolved, Jpex looks for a factory registered on the current class, then it looks for factories registered on the parent class, then that class's parent and so on until it finds a registered dependency.  
This means that if a parent class has a factory, you can overwrite it in a child class. The parent class will still use the original definition, but the child will use the new definition.  


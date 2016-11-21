$copy  
=====  
The $copy factory allows you to create a copy any object. It can be used as a function, or as an object which contains shallow and deep copy functions.  

The shallow copy will copy an object but will not create copies of its properties. So if an object has a property `x` which is an object itself, the copied object will have the exact same instance of x.  

The deep copy will copy an object and then copy all of that object's properties.  

The extend method takes any number of arguments and will deep copy the properties of the last arguments onto the first argument. i.e. `$copy.extend(a, b, c)` will copy the properties of `b` onto `a` and then `c` onto `a`. If `b` and `c` have the same property, `c`'s property wins.  
There are a couple of rules to keep in mind:  
If two objects have the same property, and the type of that property is an *object*, its properties will be combined. i.e. if `b.x.foo` is set and `c.x.bah` is set, then `a.x` will get both properties `foo` and `bah`.  
If two objects have the same property, and the type of that property is an *array*, its elements will be concatenated. i.e. if `b.x = [1, 2, 3]` and `c.x = [4, 5]` then `a.x` will be `[1,2,3,4,5]`.  

```javascript
var obj = { x : [1, 2, 3] };
var shallow, deep, extended;

shallow = $copy(obj);
// or
shallow = $copy.shallow(obj); // same as above

shallow !== obj;
shallow.x === obj.x;

deep = $copy.deep(obj);

deep !== obj;
deep.x !== obj.x;
deep.x[0] === obj.x[0];

extended = $copy.extend(0, 1); // 1

extended = $copy.extend({}, obj); // { x : [1,2,3] }

extended = $copy.extend({}, obj, {y : 'why'}); // { x : [1,2,3], y : 'why' }

extended = $copy.extend({}, {x : 'first'}, {x : 'second'}); // { x : 'second' }

extended = $copy.extend({}, {x : [1, 2, 3]}, {x : [4, 5, 6]}); // { x : [1, 2, 3, 4, 5, 6]}
```


![Jpex](https://jpex-js.github.io/dist/jpex.svg)
===========
Easy Dependency Injection
--------------------------

[![Build Status](https://travis-ci.org/jpex-js/jpex.svg?branch=master)](https://travis-ci.org/jackmellis/jpex)
[![npm version](https://badge.fury.io/js/jpex.svg)](https://badge.fury.io/js/jpex)
[![Code Climate](https://codeclimate.com/github/jackmellis/jpex/badges/gpa.svg)](https://codeclimate.com/github/jackmellis/jpex)
[![Test Coverage](https://codeclimate.com/github/jackmellis/jpex/badges/coverage.svg)](https://codeclimate.com/github/jackmellis/jpex/coverage)

Jpex is a Class wrapper and Inversion of Control framework.

*This the 2.0 of Jpex. For version 1, please refer to the [v1](https://github.com/jpex-js/jpex/blob/1.x/docs/index.md) docs*

## Getting Started

### Install
Jpex is available on [npm](https://www.npmjs.com/package/jpex):
`npm install jpex --save`

You can then include Jpex in your commonJs project:
```javascript
var Jpex = require('jpex');
Jpex.extend(...);
```
Which works out-of-the-box with *node*, *webpack* and *browserify*

Jpex also comes with a pre-built js file which can be included as a script tag on your page:
```
<script src="node_modules/jpex/dist/jpex.js"></script>
<script>
Jpex.extend(...);
</script>
```

You can also download the source code from [github](https://github.com/jpex-js/jpex)

------

### Registering Services
Services and factories are small modules or functions that provide a reusable or common piece of functionality. In Jpex, you can register **factories**:
```javascript
Jpex.register.factory('myFactory', function(){
  return {};
});
```
**services**:
```javascript
Jpex.register.service('myService', function(){
  this.method = function(){
    ...
  };
});
```
and **constants**:
```javascript
Jpex.register.constant('myConstant', 'foo');
```

------

### Using Factories
Once registered, you can request any factory when creating a new Jpex class:
```javascript
var Class = Jpex.extend(function(myFactory, myService, myConstant){
  myService.method();
  myConstant === 'foo';
});

new Class(); // creates an instance of Class using the above constructor function.
```

You can also request a factory from Jpex directly:
```javascript
var myService = Jpex.$resolve('myService');
var myConstant = Jpex.$resolve('myConstant');

myService.method();
myConstant === 'foo';
```

And finally, you can request a dependency from within another factory:
```javascript
Jpex.register.constant('myConstant', 'foo');

Jpex.register.factory('myFactory', function(myConstant){
  return {
    injectedValue : myConstant
  };
});

Jpex.register.service('myService', function(myFactory){
  this.method = function(){
    return myFactory.injectedValue;
  };
});

Jpex.$resolve('myService').method(); // returns 'foo'!
```

-------

### Extend &amp; Instantiate
You can `extend` Jpex to create a whole new *class* with its own constructor and factories. You can also extend an extended class and so on. Each extended class inherits its parent's properties and factories.
```javascript
var Class = Jpex.extend(function(inheritedService){
  // ...
});

var SubClass = Class.extend({
  constructor : function(inheritedService){
    ...
  },
  invokeParent : true, // will fire off the parent constructor
  methods : {
    methodA : function(){
      // ...
    }
  }
});
```
you can invoke a Jpex class with the `new` keyword. This will create a new instance of the class:
```javascript
var instance = new SubClass();

instance.methodA();
```

------

### Plugins
There are several [plugins](/plugins) available that add extra functionality to Jpex. The most fundamental are [jpex-node](https://www.npmjs.com/package/jpex-node) and [jpex-web](https://www.npmjs.com/package/jpex-web) that add some useful default factories to your node or web application:
```javascript
Jpex.use(require('jpex-node'));
Jpex.$resolve('$fs');
Jpex.$resolve('$promise');

// or
Jpex.use(require('jpex-web'));
Jpex.$resolve('$window');

// etc.
```

For more information, see the full documentation at [https://jpex-js.github.io](https://jpex-js.github.io)

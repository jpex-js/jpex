JPEX - Javascipt Protoype Extension
===================================
[![Build Status](https://travis-ci.org/jackmellis/jpex.svg?branch=master)](https://travis-ci.org/jackmellis/jpex)
[![npm version](https://badge.fury.io/js/jpex.svg)](https://badge.fury.io/js/jpex)
[![Code Climate](https://codeclimate.com/github/jackmellis/jpex/badges/gpa.svg)](https://codeclimate.com/github/jackmellis/jpex)
[![Test Coverage](https://codeclimate.com/github/jackmellis/jpex/badges/coverage.svg)](https://codeclimate.com/github/jackmellis/jpex/coverage)

Jpex is a Class wrapper and Inversion of Control framework.

Jpex makes it easy to create an Object-Oriented-style application in Node. It wraps up a lot of the prototypical quirks of Javascript so you can focus on creating purposeful classes. This is an intentional move away from static functions and modules in favour of providing all complex objects in the form of class instances.  

The second purpose of Jpex is to make dependency injection extremely easy. You shouldn't ever have to `require` a module within your application (other than Jpex itself), but you also shouldn't have to worry about manually injecting dependencies into every class.  
Nobody wants to call a function with 20 parameters in a specific order.  
It's not readable, maintainable, or fun. Proper dependency injection should be automagical and the caller shouldn't care what the callee depends on.

Usage
-----
Easy: require, extend, and instantiate!  
```javascript
var jpex = require('jpex');

var MyClass = jpex.extend(function($log){
  this.thing = 'hello';
  $log('My Class instantiated');
});

var instance = new MyClass();
```
There is much more that can be done with Jpex. Checkout the full documentation at https://github.com/jackmellis/jpex/blob/master/docs/index.md

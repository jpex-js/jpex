JPEX - Javascipt Protoype Extension
===================================

Overview
--------
Jpex makes it easy to create an Object-Oriented-style application in Node. It wraps up a lot of the prototypical quirks of Javascript so you can focus on creating purposeful classes. This is an intentional move away from static functions and modules in favour of providing all complex objects in the form of class instances.  
The second purpose of Jpex is to make dependency injection extremely easy. You shouldn't ever have to `require` a module within your application (other than Jpex itself), but you also shouldn't have to worry about manually injecting dependencies into every class. Nobody wants to call a function with 20 parameters in a specific order. It's not readable, maintainable, or fun. Proper dependency injection should be automagical and the caller shouldn't care what the callee depends on.


Topics
------
[Inheritence](./inheritence.md)  
[Dependency Injection](./di.md)  
[Error Handling](./errorhandling.md)  
Creating Jpex Plugins  
[API](./api/index.md)  

[Change Log](./changelog.md)

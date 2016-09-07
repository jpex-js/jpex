Creating Plugins
================
It's fairly easy to create an add-on component for Jpex.

Format
------
Generally, a plugin should be a node_modules-installable that returns a parameter-less function. You can then `require` jpex and its libraries.  
It's important after setting your plugin up, that you also apply it to the Jpex class itself. Most setup functions are only run the first time Jpex is required.

Adding Factory Types
--------------------
Most out-of-the-box factory types are all just wrappers around the main Factory type of the Constant type.  
To add a new factory type, require the `jpex/factories` module. This contains a `factories` object and an `apply` method. The apply method will bind all of the factories to the Jpex class.
```javascript
module.exports = function(){
  var factorySetup = require('jpex/factories');
  
  factorySetup.factories.MyNewFactory = function(name, param){
    return this.Register.Factory(name, () => dosomething);
  };
  
  // Apply to the Jpex class
  factorySetup.apply(require('jpex'));
};
```

Adding Default Factories
------------------------
All of the default factories are held in `jpex/defaults`. This module contains a `defaults` array and an `apply` method.  
To add a new default factory, simply add a function to the array that takes a Class as the only parameter.
```javascript
module.exports = function(){
  var defaultsSetup = reqire('jpex/defaults');
  
  defaultsSetup.defaults.push(function(Class){
    Class.Register.Factory('$plugin', function(){});
  });
  
  // Apply to the Jpex class
  defaultsSetup.apply(require('jpex'));
};
```

Adding static methods/properties
--------------------------------
This is nice and simple. `jpex/class/static` contains a `methods` and a `properties` object. These are applied to the Jpex class and then inherited by subsequent classes.
```javascript
module.exports = function(){
  var staticSetup = require('jpex/class/statc');
  
  staticSetup.methods.Test = function(){};
  staticSetup.properties.Prop = {};
  
  // Apply to the Jpex class
  staticSetup.apply(require('jpex'));
};
```

Adding Private properties
-------------------------
These properties are added to every new class that is created. The properties should be functions that return a value.  
```javascript
module.exports = function(){
  var privateSetup = require('jpex/class/privates');
  
  privateSetup.properties._privateArray = () => {return [];};
  
  // Apply to the Jpex class
  privateSetup.apply(require('jpex'));
};
```

$error
======
The $error service allows for a convenient way to organise and throw errors in your application. You can create custom error types which will be held against the $error service, meaning you can hold a library of errors for later use.

You can call $error directly and it will throw the default error type with the provided parameters.
```javascript
try{
  $error('Something went wrong');
}catch(e){
  ...
}
```

$error contains the following default error types:  
###Error  
This is just a standard error (based on the Error class). This is also the default error type, and can be accessed via `$error.Error`. The Error constructor takes 1 parameter: *message*. All error types contain the following methods:
###create
Creates an instance of the error with the provided parameters but does not throw it.
###throw
Creates and throw an error with the provided parameters.
```javascript
var err = $error.Error.create('oh dear');

$error.Error.throw('throw me');
```

Defining Errors
---------------
###The Long Way  
You can define new error types using $error's `define` function. Define takes 2 parameters: the name of the error, and an optioanl constructor function. The error type is automatically attached to the $error object.  
The constructor function can take any arguments, but the first argument will always be the message. The message property of the error instance will automatically be assigned.
```javascript
$error.define('CustomError', function(message, code){
  this.code = code;
});

$error.CustomError.throw();
```

In order to support inheritence you would then need to re-define the $error factory on each child class that uses new errors. The $error class in the background uses the *$errorFactory* service, which simply returns the object that $error uses. The important thing to ntoe is that while $error is a singleton, $errorFactory is not, so it is regenerated every time it is loaded.  
To augment new error types to $error in an inherited class, you would need to overwrite the $errorFactory service using an ancestral dependency. Then overwrite the $error service to return the newest version of $errorFactory.
```javascript
MyClass.Register.Factory('$errorFactory', ['^$errorFactory'], function($errorFactory){
  $errorFactory.define('ArgumentError');
  $errorFactory.define('FooError');
  $errorFactory.define('BahError');
  return $errorFactory;
});
MyClass.Register.Factory('$error', function($errorFactory){
  return $errorFactory;
});
```
*If you don't follow this pattern and just define new error types on the original error factory, you would make those error types available on parent classes, including overwriting existing error types. This may also affect any third party node modules that use Jpex.*  

These steps feel a little convoluted just for defining an Error that may never get used. That's why there is also a short way:

###The Short Way  



Persisting Errors
-----------------
Because we are mutating the $error object by defining new error types, this would mean you


```javascript
MyClass.Register.Factory('$errorFactory', ['^$errorFactory'], function($errorFactory){
  $errorFactory.define('ArgumentError');
  $errorFactory.define('FooError');
  $errorFactory.define('BahError');
  return $errorFactory;
});
MyClass.Register.Factory('$error', function($errorFactory){
  return $errorFactory;
});

MyClass.Register.Error('ArgumentError', function(){...});
MyClass.Register.Error('FooError', function(){...});
MyClass.Register.Error('BahError', function(){...});

^ does all this:
if (!MyClass._factories.$errorList){
  MyClass.Register.Constant('$errorList', [name, fn]);
}else{
  MyClass._factories.$errorList.value.push(name, fn);
}
if (!MyClass._factories.$errorFactory){
    MyClass.Register.Factory('$errorFactory', ['$errorList', '^$errorFactory'], function($errorFactory){
      $errorList.forEach(function(e){
        $errorFactory.define(e);
      });
    });
}
if (!MyClass._factories.$error){
  MyClass.Register.Factory('$error', '$errorFactor', function($...){
    return $...;
  }, true)
}
```
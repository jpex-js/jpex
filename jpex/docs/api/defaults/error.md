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
You can define new error types using $error's `define` function. Define takes 2 parameters: the name of the error, and an optioanl constructor function. The error type is automatically attached to the $error object.  
The constructor function can take any arguments, but the first argument will always be the message. The message property of the error instance will automatically be assigned.
```javascript
$error.define('CustomError', function(message, code){
  this.code = code;
});

$error.CustomError.throw();
```

Persisting Errors
-----------------
Because we are mutating the $error object by defining new error types, this would mean you


```javascript
MyClass.Register.Factory('$error', function($errorFactory){
  $errorFactory.define('ArgumentError');
  $errorFactory.define('FooError');
  $errorFactory.define('BahError');
}, true);
```
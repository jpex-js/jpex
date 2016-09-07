$error
=======
The $error service allows for a convenient way to organise and throw errors in your application. You can create custom error types which will be held against the $error service, meaning you can hold a library of errors for later use.  
*For usage examples and best practices, as well as error handling, see the [Error Handling](../../errorhandling.md) section.*


$error 
------
*(message, arguments...)*  
This will throw the default error using the provided parameters (based on `$error.default`).
```javascript
try{
  $error('Something went wrong');
}catch(e){
  ...
}
```

$error.Error  
------------
This is a standard error (based on the Error class). This is also the default error type. All defined errors have the same properties available:  
###$error.Error.create  
Creates an instance of the error with the provided parameters, but does not throw it.  
###$error.Error.throw  
Creates and throws an error with the provided parameters.


$error.define  
-------------
*(name, constructorFunction)*  
You can define new error types using $error's `define` function. The error type is automatically attached to the $error object.  
The constructor function can take any arguments, but the first argument will always be the message. The message property of the error instance will automatically be assigned.
```javascript
$error.define('CustomError', function(message, code){
  this.code = code;
});

$error.CustomError.throw();
```

$error.default  
--------------
This is the default error that will be thrown when calling $error directly. It can be set to any custom error class.
```javascript
$error.default = $error.CustomError;
```
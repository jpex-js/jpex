Error Handling
==============
Throwing Errors
---------------
The [$error](./api/defaults/error.md) service allows for a convenient way to organise and throw errors in your application. You can create custom error types which will be held against the $error service, meaning you can hold a library of errors for later use.

There are number of ways to throw an error using $error:
```javascript
$error('throws a default error type');
$error.CustomError.throw('throws a custom error type');
throw $error.CustomError.create('creates an error but has to be thrown manually');
throw new $error.CustomError('instantiated and thrown manually');
```

###Error Types  
$error contains the following default error types:  
###Error  
This is just a standard error (based on the Error class) which takes a message parameter.  


Defining Errors
---------------
###The Hard Way  
You can define new error types using $error's `define` function. Define takes 2 parameters: the name of the error, and an optional constructor function. The error type is automatically attached to the $error object.  
The constructor function can take any arguments, but the first argument will always be the message. The message property of the error instance will automatically be assigned.
```javascript
$error.define('CustomError', function(message, code){
  this.code = code;
});

$error.CustomError.throw();
```

####Caveat: Inheritence  
If you were to inject $error into your class or factory and define new error types on it, this would mutate the original $error object used by all classes you have inherited from. This runs the risk of exposing errors you don't want to expose to parent classes, or overwriting error types used by third parties or completely separate classes.  

In order to support inheritence you would need to re-register the $error factory on any class that defines new errors. The $error class in the background uses the *$errorFactory* service, which simply returns the $error instance. The important thing to note is that while $error is a singleton, $errorFactory is not, so it is recreated every time you inject it.  
To add new error types to $error without polluting parent classes, you would need to overwrite the $errorFactory service using an ancestral dependency. Then overwrite the $error service to return the newest version of $errorFactory:
```javascript
var ParentClass = Jpex.extend();
ParentClass.Register.Factory('$errorFactory', '^$errorFactory', function($errorFactory){
  $errorFactory.define('ParentError');
  return $errorFactory;
});
ParentClass.Register.Factory('$error', function($errorFactory){
  return $errorFactory;
});

var MyClass = ParentClass.extend();

MyClass.Register.Factory('$errorFactory', '^$errorFactory', function($errorFactory){
  $errorFactory.define('ChildError');
  return $errorFactory;
});
MyClass.Register.Factory('$error', function($errorFactory){
  return $errorFactory;
}, true);

// ParentClass would have access to $error.ParentError only

// MyClass would have access to $error.ParentError and $error.ChildError.
```

These steps feel a little convoluted just for defining an error type that may never get used. That's why there is also a shortcut for this:

###The Easy Way  
The [ErrorType](./factories/errortype.md) factory will register a new error type for you. It will automatically handle all of the re-registering, making it nice and easy to create an Error specific to your class:
```javascript
var ParentClass = Jpex.extend();
ParentClass.Register.ErrorType('ParentError');

var MyClass = ParentClass.extend();
MyClass.Register.ErrorType('ChildError');
```

Handling Errors
---------------
When an error is thrown in your application, Jpex will attempt to handle it using $errorHandler. $errorHandler should be a function that takes a single parameter of the error. The $errorHandler factory is not defined by default, so if Jpex cannot find it, it will just allow the error to bubble up through the application stack.
```javascript
Jpex.Register.Factory('$errorHandler', function($log){
  return function(e){
    $log.error('An error has been caught');
    throw e;
  };
});

var MyClass = Jpex.extend(function($error, $errorHandler){
  $error('This will be caught by $errorHandler');
  
  $errorHandler('Pass this straight to $errorHandler');
});
```

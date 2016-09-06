ErrorType
=========
| Parameter     | Type          | Default   |
|---------------|---------------|-----------|
| Name          | String        |           |
| Constructor   | Function      | Optional  |
The *ErrorType* factory will register a new error type against the class. It can then be accessed via the $error factory.

```javascript
var ParentClass = Jpex.extend(function($error){
  $error.ParentError.throw();
});
ParentClass.Register.ErrorType('ParentError', function(){
  this.code = 123;
});
```

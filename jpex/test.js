var jpex = require('.');
var Class = jpex.extend(function($error){
  $error('Something went Wrong');
});
Class.Register.Decorator('$error', function(){
  this.declare('Custom', function(){
    this.code = 1234;
  });
  return this;
});
Class.Register.Factory('$errorHandler', function($log){
  return function(err){
    $log('An error has been captured and handled');
    $log.error(err.message);
  };
});
new Class();

var SubClass = Class.extend(function($error){
  $error.Custom('A Custom Error').throw();
});
new SubClass();
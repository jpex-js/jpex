'use strict';

module.exports = function(NewClass){
  NewClass.Register.Constant('$timeout', setTimeout);
  NewClass.Register.Constant('$interval', setInterval);
  NewClass.Register.Constant('$immediate', setImmediate);
  NewClass.Register.Constant('$tick', process.nextTick);
  NewClass.Register.Factory('$log', null, function(){
      var $log;
      $log = function(){
          return $log.log.apply(console, arguments);
      };
      $log.log = console.log;
      $log.info = console.info;
      $log.warn = console.warn;
      $log.error = console.error;
      return $log;
  }, true);
  NewClass.Register.Factory('$promise', null, function(){
    var $promise = function(fn){
      return new Promise(fn);
    };
    $promise.all = Promise.all;
    $promise.race = Promise.race;
    $promise.reject = Promise.reject;
    $promise.resolve = Promise.resolve;
    return $promise;
  }, true);
  
  NewClass.Register.Factory('$error', null, function(){    
    var $error = function(){
      $error.Standard.apply(this, arguments).throw();
    };
    
    $error.declare = function(name, fn){
      var NewError = function(message){
        this.message = message;
        
        if (Error.captureStackTrace){
          Error.captureStackTrace(this, this.constructor);
        }else{
          this.stack = (new Error()).stack;
        }
        
        if (fn){
          fn.apply(this, arguments);
        }
      };
      NewError.prototype = Object.create(Error.prototype);
      NewError.prototype.constructor = NewError;
      NewError.prototype.name = name;
      NewError.prototype.throw = function(){
        throw this;
      };
      
      $error[name] = function(message){
        return $error.create(NewError, message);
      };
      $error[name].Class = NewError;
      return NewError;
    };
    $error.create = function(ErrorClass){
      var err = new (Function.prototype.bind.apply(ErrorClass, arguments));
      return err;
    };
    
    $error.declare('Error');
    $error.Error.Class = Error;
    $error.Standard = $error.Error;
    
    return $error;
  });
};
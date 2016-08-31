function ErrorUtil(){}


module.exports = function(NewClass){  
  NewClass.Register.Factory('$error', null, function(){  
    // Throw the standard error
    var $error = function(){
      $error.Standard.apply(this, arguments).throw();
    };
    
    // create a new error type and add it to $error
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
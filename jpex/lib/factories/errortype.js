module.exports = function(name, fn){
  // Register an error types constant
  if (!this._factories._errorTypes){
    this.Register.Constant('_errorTypes', []);
  }
  // Add the error type to the class
  this._factories._errorTypes.value.push({name : name, fn : fn});
  
  // Register $errorFactory
  if (!this._factories.$errorFactory){
    this.Register.Factory('$errorFactory', ['^$errorFactory', '_errorTypes'], function($errorFactory, errorTypes){
      errorTypes.forEach(function(type){
        $errorFactory.define(type.name, type.fn);
      });
      
      return $errorFactory;
    });
  }
  
  // Register $error
  if (!this._factories.$error){
    this.Register.Factory('$error', '$errorFactory', function($errorFactory){
      return $errorFactory;
    }, true);
  }
  
  return this;
};
module.exports = function(NewClass){  
  NewClass.Register.Interface('$ierror', i => i.functionWith({
    define : i.function,
    default : i.function,
    Error : i.function
  }));
  
  NewClass.Register
    .Factory('$error', '$errorFactory', function($errorFactory){
      return $errorFactory;
    })
    .interface('$ierror')
    .lifecycle.application();
};
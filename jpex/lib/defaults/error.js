module.exports = function(NewClass){  
  NewClass.Register.Factory('$error', '$errorFactory', function($errorFactory){
    return $errorFactory;
  }, true);
};
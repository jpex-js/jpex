module.exports = function(NewClass){
  // interface
  var ipromise = () => {};
  ipromise.all = () => {};
  ipromise.race = () => {};
  ipromise.reject = () => {};
  ipromise.resolve = () => {};
  NewClass.Register.Interface('$promise', ipromise);
  
  // wraps the Promise class
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
};
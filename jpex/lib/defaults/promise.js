module.exports = function(NewClass){
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
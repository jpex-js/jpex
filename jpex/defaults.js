module.exports = function(NewClass){
  NewClass.Register.Constant('$timeout', setTimeout);
  NewClass.Register.Constant('$interval', setInterval);
  NewClass.Register.Constant('$immediate', setImmediate);
  NewClass.Register.Constant('$tick', process.nextTick);
  NewClass.Register.Factory('$log', null, function(){
      var $log = function(){
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
  });
};
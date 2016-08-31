module.exports = function(NewClass){
  // Log a message to the consolr
  NewClass.Register.Factory('$log', null, function(){
      var $log;
      $log = () => $log.log.apply(console, arguments);
      $log.log = console.log;
      $log.info = console.info;
      $log.warn = console.warn;
      $log.error = console.error;
      return $log;
  }, true);
};
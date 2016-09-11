module.exports = function(NewClass){
  // $log Interface
  var ilog = () => {};
  ilog.log = null;
  ilog.warn = null;
  ilog.error = null;
  NewClass.Register.Interface('$log', ilog);
  
  // Log a message to the console
  NewClass.Register.Factory('$log', null, function(){
      var $log = function(){
        console.log.apply(console, arguments);
      };
      $log.log = console.log;
      $log.info = console.info;
      $log.warn = console.warn;
      $log.error = console.error;
      return $log;
  }, true);
};
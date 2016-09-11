module.exports = function(NewClass){
  var interface = () => {};
  NewClass.Register.Interface('$timeout', interface);
  NewClass.Register.Interface('$interval', interface);
  NewClass.Register.Interface('$immediate', interface);
  NewClass.Register.Interface('$tick', interface);
  
  NewClass.Register.Constant('$timeout', setTimeout);
  NewClass.Register.Constant('$interval', setInterval);
  NewClass.Register.Constant('$immediate', setImmediate);
  NewClass.Register.Constant('$tick', process.nextTick);
};
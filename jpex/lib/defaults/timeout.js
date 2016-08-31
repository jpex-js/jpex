module.exports = function(NewClass){
  NewClass.Register.Constant('$timeout', setTimeout);
  NewClass.Register.Constant('$interval', setInterval);
  NewClass.Register.Constant('$immediate', setImmediate);
  NewClass.Register.Constant('$tick', process.nextTick);
};
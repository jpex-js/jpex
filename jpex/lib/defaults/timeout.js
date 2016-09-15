module.exports = function(NewClass){  
  NewClass.Register.Interface('$itimeout', i => i.function);
  NewClass.Register.Interface('$iinterval', i => i.function);
  NewClass.Register.Interface('$iimeddiate', i => i.function);
  NewClass.Register.Interface('$itick', i => i.function);
  
  NewClass.Register.Constant('$timeout', setTimeout).interface('$itimeout');
  NewClass.Register.Constant('$interval', setInterval).interface('$iinterval');
  NewClass.Register.Constant('$immediate', setImmediate).interface('$iimediate');
  NewClass.Register.Constant('$tick', process.nextTick).interface('$itick');
};
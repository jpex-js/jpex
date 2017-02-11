module.exports = function(NewClass){
  NewClass.Register.Interface('$itimeout', i => i.function);
  NewClass.Register.Interface('$iinterval', i => i.function);
  NewClass.Register.Interface('$iimeddiate', i => i.function);
  NewClass.Register.Interface('$itick', i => i.function);

  NewClass.Register.Factory('$timeout', function () {
    function timeout(cb, delay){
      return setTimeout(cb, delay);
    };
    timeout.clear = function(t){
      return clearTimeout(t);
    };
    return timeout;
  }).lifecycle.application().interface('$itimeout');

  NewClass.Register.Factory('$interval', function(){
    function interval(cb, delay){
      return setInterval(cb, delay);
    }
    interval.clear = function (t) {
      return clearInterval(t);
    };
    return interval;
  }).lifecycle.application().interface('$iinterval');

  NewClass.Register.Factory('$immediate', '$timeout', function ($timeout) {
    var native = (typeof setImmediate === 'function');
    function immediate(cb) {
      return native ? setImmediate(cb) : $timeout(cb, 0);
    };
    immediate.clear = function (t) {
      return native ? clearImmediate(t) : $timeout.clear(t);
    };
    return immediate;
  }).lifecycle.application().interface('$iimediate');

  NewClass.Register.Factory('$tick', '$immediate', function ($immediate) {
    var native = (typeof process !== 'undefined' && typeof process.nextTick === 'function');
    function tick(cb){
      return native ? process.nextTick(cb) : $immediate(cb);
    }
    return tick;
  }).lifecycle.application().interface('$itick');
};

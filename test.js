var Jpex = require('./jpex');
var Class = Jpex.extend(function($resolve){
  var $fs = $resolve('$fs');
  var foo = $resolve('foo');
});
Class.Register.Factory('foo', () => 'bah');
Class();

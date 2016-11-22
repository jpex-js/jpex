var Jpex = require('./jpex');
var Class = Jpex.extend({
  dependencies : ['$error'],
  constructor : function($error){

  }
});
Class.Register.ErrorType('DemoError');
new Class();

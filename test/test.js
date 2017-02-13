var Jpex = require('../src');
Jpex.register.factory('foo', function () {
  return {
    foo : 'bah'
  };
});
var Parent = Jpex.extend({
  constructor : function () {
    console.log('Parent Constructor');
  },
  config : {
    dependencies : ['foo'],
    bindToInstance : '$deps.$thingy',
    invokeParent : true
  }
});
var Child = Parent.extend(function () {
  console.log('Child Constructor');
  console.log(this.$deps.$thingy.foo);
});

Child();

var Jpex = require('.');
var Class = Jpex.extend(function(myService, myConstant, myFactory){
  
});
Class.Register.Interface('myService', {
  name : '',
  count : 0,
  arr : [
    {
      any : null
    }
  ],
  reg : new RegExp()
});
Class.Register.Service('myService', function(){
  this.name = 'my service';
  this.count = 1234;
  this.arr = [
    {
      any : 123
    }
  ];
  this.reg = /abc/;
});

Class.Register.Interface('myConstant', Function);
Class.Register.Constant('myConstant', () => {});

Class.Register.Factory('myFactory', function(myConstant){
  return {};
}, true);

new Class();
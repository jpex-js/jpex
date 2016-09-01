// Dependency Injection registration
module.exports = {
  factories : {
    Constant : require('./constant'),
    Factory : require('./factory'),
    Decorator : require('./decorator'),
    Service : require('./service'),
    Enum : require('./enum'),
    File : require('./file'),
    Folder : require('./folder'),
    NodeModule : require('./nodemodule')
  },
  apply : function(Class){
    var self = this;
    var register = function(){
      return register.Factory.apply(Class, arguments);
    };
    Object.keys(self.factories).forEach(function(f){
      var fn = self.factories[f];
      register[f] = fn.bind(Class);
    });
    
    Class.Register = register;
  }
};
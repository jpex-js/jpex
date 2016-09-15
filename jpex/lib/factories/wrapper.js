module.exports = function(factory){
  var wrapper = {
    lifecycle : function(val){
      factory.lifecycle = val;
      return wrapper;
    },
    interface : function(val){
      factory.interface = (factory.interface || []).concat(val);
      return wrapper;
    },
    
    _toConstant : function(val){
      factory.value = val;
      factory.constant = true;
    }
  };
  
  return wrapper;
};
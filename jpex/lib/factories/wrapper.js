module.exports = function(factory){
  var wrapper = {
    interface : function(val){
      factory.interface = (factory.interface || []).concat(val);
      return wrapper;
    },
    lifecycle : {
      application : function(){
        factory.lifecycle = 1;
        return wrapper;
      },
      class : function(){
        factory.lifecycle = 2;
        return wrapper;
      },
      instance : function(){
        factory.lifecycle = 3;
        return wrapper;
      },
      none : function(){
        factory.lifecycle = 4;
        return wrapper;
      }
    }
  };
  
  return wrapper;
};
/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/

  var Base;
  

    var service, Class;
      service = undefined;
      
      Base = require('.').extend(function(){});
      Base.Register.Interface('iService', function(i){
        return {
          a : i.any()
        };
      });
      
      Class = Base.extend({
        dependencies : 'iService',
        constructor : function(s){
          service = s;
        }
      });


      Class.Register.Interface('iService', i => ({a : i.any()}), 'iFactory');
      Class.Register.Interface('iFactory', i => ({b : i.any()}), 'iObject');
      Class.Register.Interface('iObject', i => ({c : i.any()}));
      
//      new Class({iService : {a : true}});
//        new Class({iService : {a : true, b : true,}});
//        new Class({iService : {a : true, c : true}});
      
//      new Class({iService : {a : true, b : true, c : true}});
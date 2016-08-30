/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Constant', function(){
      it('should return a constant value', function(){
        var obj = {};
        First.Register.Constant('object', obj);
        
        expect(First._factories.object).toBeDefined();
        expect(First._factories.object.value).toBe(obj);
        expect(First._factories.object.constant).toBe(true);
        
        var Second = First.extend({
          constructor : function(obj2){
            expect(obj2).toBe(obj);
          },
          dependencies : 'object'
        });
        
        new Second();
      });
    });
  });
});
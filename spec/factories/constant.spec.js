describe('Base Class - Dependency Injection', function(){
  var Base, First;

  beforeEach(function(){
    Base = require('../../src');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Constant', function(){
      it('should return a constant value', function(){
        var obj = {};
        First.register.constant('object', obj);

        expect(First.$$factories.object).toBeDefined();
        expect(First.$$factories.object.value).toBe(obj);
        expect(First.$$factories.object.constant).toBe(true);

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

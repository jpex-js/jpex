describe('Base Class - Dependency Injection', function(){
  var Base, First;

  beforeEach(function(){
    Base = require('../../src');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Factory (instance - default)', function(){

      it('should register a factory function', function(){
        var fn = function(){};
        First.register.factory('test', fn);
        expect(First.$$factories.test.fn).toBe(fn);
      });

      it('should add an instance lifecycle', function(){
        var fn = function(){};
        First.register.factory('test', fn);
        expect(First.$$factories.test).toBeDefined();
        expect(First.$$factories.test.lifecycle).toBe(3);
      });

      it('should register a factory by calling register', function(){
        var fn = function(){};
        First.register('test', fn);
        expect(First.$$factories.test.fn).toBe(fn);
      });

      it('should run the factory for every dependency request', function(){
        var fn = function(){
          return {};
        };
        First.register.factory('test', fn);

        var lastObj;

        var Second = First.extend({
          constructor : function(obj){
            expect(obj).toBeDefined();
            expect(obj).not.toBe(lastObj);
            lastObj = obj;
          },
          dependencies : 'test'
        });

        new Second();
        new Second();
        new Second();
        expect(lastObj).toBeDefined();
      });

      it('should accept dependencies', function(){
        First.register.factory('a', function(){
          return 'A';
        });
        First.register.factory('b', 'a', function(a){
          return a + 'B';
        });

        var Second = First.extend({
          constructor : function(a, b){
            expect(a).toBe('A');
            expect(b).toBe('AB');
          },
          dependencies : ['a', 'b']
        });

        new Second();
      });

      it('should skip if no function is provided', function(){
        expect(() => First.register.factory('test')).toThrow();
        expect(First.$$factories.test).toBeUndefined();
      });
    });

    describe('Factory (singleton)', function(){
      it('should add a singleton lifecycle', function(){
        var fn = function(){};
        First.register.factory('test', fn).lifecycle.application();
        expect(First.$$factories.test).toBeDefined();
        expect(First.$$factories.test.lifecycle).toBe(1);
      });
      it('should only create one instance of the factory function', function(){
        var fn = function(){
          return {};
        };
        First.register.factory('test', fn).lifecycle.application();

        var lastObj;

        var Second = First.extend({
          constructor : function(obj){
            expect(obj).toBeDefined();
            if (lastObj){
              expect(obj).toBe(lastObj);
            }
            lastObj = obj;
          },
          dependencies : 'test'
        });

        new Second();
        new Second();
        new Second();
        expect(lastObj).toBeDefined();
      });
      it('should store the instance against the original class', function(){
        var result = [];
        var A = First.extend(function(test){
          result.push(test);
        });
        var B = A.extend(function(test){
          result.push(test);
        });
        var C = B.extend(function(test){
          result.push(test);
        });

        A.register.factory('test', null, () => ({})).lifecycle.application();

        new C();
        new B();
        new A();

        expect(result[0]).toBe(result[1]);
        expect(result[0]).toBe(result[2]);
      });
    });
  });
});

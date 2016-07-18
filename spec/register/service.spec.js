/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Service (instance - default)', function(){
      it('should register a service', function(){
        First.Register.Service('test', function(){});
        expect(First._factories.test).toBeDefined();
      });
      it('should wrap the function in a factory function', function(){
        var fn = function(){};
        First.Register.Service('test', fn);
        expect(First._factories.test.fn).not.toBe(fn);
      });
      it('should create a new instance of the service when injected', function(){
        var fn = function(){
          this.val = 'hello!';
        };
        First.Register.Service('test', fn);
        
        var Second = First.extend({
          dependencies : 'test',
          constructor : function(test){
            expect(test.val).toBe('hello!');
          }
        });
        
        new Second();
      });
      it('should create a new instance every time', function(){
        var fn = function(){};
        First.Register.Service('test', fn);
        
        var lastObj;
        
        var Second = First.extend({
          dependencies : 'test',
          constructor : function(obj){
            expect(obj).toBeDefined();
            expect(obj).not.toBe(lastObj);
            lastObj = obj;
          }
        });
        
        new Second();
        new Second();
        new Second();
        
        expect(lastObj).toBeDefined();
      });
      it('should inject dependencies into the service', function(){
        var factory = function(){
          return 'A';
        };
        var service = function(a){
          this.val = a;
        };
        First.Register.Factory('a', factory);
        First.Register.Service('b', 'a', service);
        
        var Second = First.extend({
          dependencies : ['a', 'b'],
          constructor : function(a, b){
            expect(a).toBe('A');
            expect(b.val).toBe('A');
          }
        });
        
        new Second();
      });
      
      it('should skip if no function is provided', function(){
        First.Register.Service('test', ['dependency']);
        expect(First._factories.test).toBeUndefined();
      });
    });
    
    describe('Service (singleton)', function(){
      it('should only create a single instance', function(){
        var fn = function(){};
        First.Register.Service('test', fn, true);
        
        var lastObj;
        
        var Second = First.extend({
          dependencies : 'test',
          constructor : function(obj){
            expect(obj).toBeDefined();
            if (lastObj){
              expect(obj).toBe(lastObj);
            }
            lastObj = obj;
          }
        });
        
        new Second();
        new Second();
        new Second();
        
        expect(lastObj).toBeDefined();
      });
    });
  });
});
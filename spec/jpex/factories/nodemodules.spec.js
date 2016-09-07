/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Node Modules', function(){
      it('should try to require the dependency from node_modules', function(done){
        var Second = First.extend(function(istanbul){
          expect(istanbul).toBeDefined();
          done();
        });
        
        new Second();
      });
      it('should cache the node module', function(done){
        var Second = First.extend(function(istanbul){
          expect(istanbul).toBeDefined();
          expect(Second._factories.istanbul).toBeDefined();
          done();
        });
        
        expect(Second._factories.istanbul).toBeUndefined();
        new Second();
      });
      it('should manually add a node module', function(done){
        First.Register.NodeModule('istanbul');
        
        var Second = First.extend(function(istanbul){
          expect(istanbul).toBeDefined();
          expect(First._factories.istanbul).toBeDefined();
          expect(Second._factories.istanbul).toBeUndefined();
          done();
        });
        
        expect(Second._factories.istanbul).toBeUndefined();
        new Second();
      });
    });
  });
});
describe('Base Class - Dependency Injection', function(){
  var Base, First;

  beforeEach(function(){
    Base = require('../../src').extend();
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Node Modules', function(){
      it('should try to require the dependency from node_modules', function(done){
        var Second = First.extend(function(path){
          expect(path).toBeDefined();
          done();
        });

        new Second();
      });
      it('should cache the node module', function(done){
        var Second = First.extend(function(path){
          expect(path).toBeDefined();
          expect(Second.$$factories.path).toBeDefined();
          done();
        });

        expect(Second.$$factories.path).toBeUndefined();
        new Second();
      });
      it('should manually add a node module', function(done){
        First.register.nodeModule('path');

        var Second = First.extend(function(path){
          expect(path).toBeDefined();
          expect(First.$$factories.path).toBeDefined();
          expect(Object.hasOwnProperty.call(First.$$factories, 'path')).toBe(true);
          expect(Object.hasOwnProperty.call(Second.$$factories, 'path')).toBe(false);
          done();
        });

        expect(Object.hasOwnProperty.call(Second.$$factories, 'path')).toBe(false);
        new Second();
      });
    });
  });
});

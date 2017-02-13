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
        var Second = First.extend(function(path){
          expect(path).toBeDefined();
          done();
        });

        new Second();
      });
      it('should cache the node module', function(done){
        var Second = First.extend(function(path){
          expect(path).toBeDefined();
          expect(Second._factories.path).toBeDefined();
          done();
        });

        expect(Second._factories.path).toBeUndefined();
        new Second();
      });
      it('should manually add a node module', function(done){
        First.Register.NodeModule('path');

        var Second = First.extend(function(path){
          expect(path).toBeDefined();
          expect(First._factories.path).toBeDefined();
          expect(Object.hasOwnProperty.call(First._factories, 'path')).toBe(true);
          expect(Object.hasOwnProperty.call(Second._factories, 'path')).toBe(false);
          done();
        });

        expect(Object.hasOwnProperty.call(Second._factories, 'path')).toBe(false);
        new Second();
      });
    });
  });
});

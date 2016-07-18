/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });
  
  describe('Resolve dependencies', function(){
    it('should resolve dependencies with services and factories', function(){
      First.Register.Factory('factory', () => 'FACTORY');
      First.Register.Service('service', function(){this.val = 'SERVICE';});
      First.Register.Service('dependent', function(){this.val = 'DEPENDENT';});
      First.Register.Service('master', 'dependent', function(d){this.val = 'MASTER'; this.sub = d.val;});
      First.Register.Constant('constant', 'CONSTANT');
      
      var Second = First.extend({
        dependencies : ['factory', 'service', 'master', 'constant'],
        constructor : function(f, s, m, c){
          expect(f).toBe('FACTORY');
          expect(s.val).toBe('SERVICE');
          expect(m.val).toBe('MASTER');
          expect(m.sub).toBe('DEPENDENT');
          expect(c).toBe('CONSTANT');
        }
      });
      
      new Second();
    });
    it('should resolve using named parameters', function(){
      var Second = First.extend({
        dependencies : 'named',
        constructor : function(n){
          expect(n).toBe('i am named');
        }
      });
      
      new Second({named : 'i am named'});
    });
    it('should resolve object dependencies', function(){
      var hasRun = false;
    
      First.Register.Factory('a', '$options', function($options){
        expect($options).toBe('abcdef');
        hasRun = true;
      });
      First.Register.Factory('b', {a : 'abcdef'}, function(){});
      
      var Second = First.extend({
        dependencies : 'b',
        constructor : function(){}
      });
      
      new Second();
      
      expect(hasRun).toBe(true);
    });
    it('should error if dependency doesn\'t exist', function(){
      var Second = First.extend({
        dependencies : 'false'
      });
      
      var err;
      
      new Second({false : 'false'});
      
      try{
        new Second();
      }
      catch(e){
        err = e;
      }
      finally{
        expect(err).toBeDefined();
      }
    });
  });
  
  describe('Inheritance', function(){
    it('should use factories of ancestor classes', function(){
      First.Register.Factory('a', function(){
        return 'A';
      });
      var Second = First.extend();
      var Third = Second.extend();
      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('A');
        }
      });
      
      new Fourth();
    });
    it('should overwrite ancestor classes', function(){
      First.Register.Factory('a', () => 'A');
      var Second = First.extend();
      var Third = Second.extend();
      Third.Register.Factory('a', () => 'B');
      
      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('B');
        }
      });
      
      new Fourth();
    });
    it('should use named parameters over registered dependencies', function(){
      First.Register.Factory('a', () => 'A');
      var Second = First.extend();
      var Third = Second.extend();
      Third.Register.Factory('a', () => 'B');
      
      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('C');
        }
      });
      
      new Fourth({a : 'C'});
    });
    it('should not use factories of a child class', function(){
      First.Register.Factory('a', () => 'A');
      var Second = First.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('A');
        }
      });
      var Third = Second.extend();
      Third.Register.Factory('a', () => 'B');
      
      new Second();
    });
  });
  
  describe('Inferred Dependencies', function(){
    it('should calculate dependencies based on the constructor function', function(){
      var A = First.extend(function(a, b, c){
        expect(a).toBe('A');
        expect(b).toBe('B');
        expect(c).toBe('C');
      });
      A.Register.Constant('a', 'A');
      A.Register.Constant('b', 'B');
      
      expect(A.Dependencies).toBeDefined();
      expect(A.Dependencies.length).toBe(3);
      expect(A.Dependencies[0]).toBe('a');
      expect(A.Dependencies[1]).toBe('b');
      expect(A.Dependencies[2]).toBe('c');
    });
    it('should also work for arrow functions', function(){
      var A = First.extend((a, b, c) => {
        expect(a).toBe('A');
        expect(b).toBe('B');
        expect(c).toBe('C');
      });
      A.Register.Constant('a', 'A');
      A.Register.Constant('b', 'B');
      
      expect(A.Dependencies).toBeDefined();
      expect(A.Dependencies.length).toBe(3);
      expect(A.Dependencies[0]).toBe('a');
      expect(A.Dependencies[1]).toBe('b');
      expect(A.Dependencies[2]).toBe('c');
    });
    it('should also work for single-parameter arrow functions', function(){
      var A = First.extend(a => {
        expect(a).toBe('A');
      });
      
      expect(A.Dependencies).toBeDefined();
      expect(A.Dependencies.length).toBe(1);
      expect(A.Dependencies[0]).toBe('a');
    });
    it('should infer dependencies for factories', function(){
      var A = First.extend(function(service){
        expect(service.val.val).toBe('A');
      });
      A.Register.Constant('a', 'A');
      A.Register.Factory('factory', function(a){
        return {
          val : a
        };
      });
      A.Register.Service('service', function(factory){
        this.val = factory;
      });
      
      new A();
    });
  });
  
  describe('Recursion', function(){
    it('should error if a dependency is recurring', function(){
      First.Register.Factory('a', function(a){});
      var A = First.extend(function(a){});
      
      var err;
      try{
        new A();
      }
      catch(e){
        err = e;
      }
      finally{
        expect(err).toBeDefined();
        expect(err.message).toBe('Recursive loop for dependency a encountered');
      }
    });
  });
  
  describe('Bind to Instance', function(){
    it('should bind dependencies to the instance', function(){
      First.Register.Factory('myFactory', function(){
        return {};
      });
      var Second = First.extend({
        bindToInstance : true,
        constructor : function(myFactory, myService, myNamedParameter, fs){}
      });
      Second.Register.Service('myService', function(){});
      
      var instance = new Second({myNamedParameter : {}});
      
      expect(instance.myFactory).toBeDefined();
      expect(instance.myService).toBeDefined();
      expect(instance.myNamedParameter).toBeDefined();
      expect(instance.fs).toBeDefined();
    });
  });
});
describe('Base Class - Dependency Injection', function(){
  var Base, First;

  beforeEach(function(){
    Base = require('../../src').extend();
    First = Base.extend();
  });

  describe('Resolve dependencies', function(){
    it('should resolve dependencies with services and factories', function(){
      First.register.factory('factory', () => 'FACTORY');
      First.register.service('service', function(){this.val = 'SERVICE';});
      First.register.service('dependent', function(){this.val = 'DEPENDENT';});
      First.register.service('master', 'dependent', function(d){this.val = 'MASTER'; this.sub = d.val;});
      First.register.constant('constant', 'CONSTANT');

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

      First.register.factory('a', '$options', function($options){
        expect($options).toBe('abcdef');
        hasRun = true;
      });
      First.register.factory('b', {a : 'abcdef'}, function(){});

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
    it('should not error if dependency is optional', function(){
      var Second = First.extend(function(_false_){
        expect(_false_).toBeUndefined();
      });

      new Second();
    });
    it('should not error if optional dependency\'\s dependencies fail', function(){
      var Second = First.extend(function(_exists_){
        expect(_exists_).toBeUndefined();
      });
      Second.register.factory('exists', function(notExists){
        throw new Error('Exists factory should not run');
      });

      new Second();
    });
    it('should load an optional dependency', function(){
      var Second = First.extend(function(_a_){
        expect(_a_).toBe('B');
      });
      Second.register.factory('a', function(b){
        return b;
      });
      Second.register.factory('b', function(){
        return 'B';
      });

      new Second();
    });
  });

  describe('Inheritance', function(){
    it('should use factories of ancestor classes', function(){
      First.register.factory('a', function(){
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
      First.register.factory('a', () => 'A');
      var Second = First.extend();
      var Third = Second.extend();
      Third.register.factory('a', () => 'B');

      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('B');
        }
      });

      new Fourth();
    });
    it('should use named parameters over registered dependencies', function(){
      First.register.factory('a', () => 'A');
      var Second = First.extend();
      var Third = Second.extend();
      Third.register.factory('a', () => 'B');

      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('C');
        }
      });

      new Fourth({a : 'C'});
    });
    it('should not use factories of a child class', function(){
      First.register.factory('a', () => 'A');
      var Second = First.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('A');
        }
      });
      var Third = Second.extend();
      Third.register.factory('a', () => 'B');

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
      A.register.constant('a', 'A');
      A.register.constant('b', 'B');
    });
    it('should also work for arrow functions', function(){
      var A = First.extend((a, b, c) => {
        expect(a).toBe('A');
        expect(b).toBe('B');
        expect(c).toBe('C');
      });
      A.register.constant('a', 'A');
      A.register.constant('b', 'B');
    });
    it('should also work for single-parameter arrow functions', function(){
      var A = First.extend(a => {
        expect(a).toBe('A');
      });
    });
    it('should infer dependencies for factories', function(){
      var A = First.extend(function(service){
        expect(service.val.val).toBe('A');
      });
      A.register.constant('a', 'A');
      A.register.factory('factory', function(a){
        return {
          val : a
        };
      });
      A.register.service('service', function(factory){
        this.val = factory;
      });

      new A();
    });
  });

  describe('Recursion', function(){
    it('should error if a dependency is recurring', function(){
      First.register.factory('a', function(a){});
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
      First.register.factory('myFactory', function(){
        return {};
      });
      var Second = First.extend({
        bindToInstance : true,
        constructor : function(myFactory, myService, myNamedParameter, fs){}
      });
      Second.register.service('myService', function(){});

      var instance = new Second({myNamedParameter : {}});

      expect(instance.myFactory).toBeDefined();
      expect(instance.myService).toBeDefined();
      expect(instance.myNamedParameter).toBeDefined();
      expect(instance.fs).toBeDefined();
    });
    it('should bind to a named property of an instance', function(){
      First.register.factory('myFactory', function(){
        return {};
      });
      var Second = First.extend({
        bindToInstance : '_bound',
        dependencies : ['myFactory', 'myService', 'myNamedParameter', 'fs']
      });
      Second.register.service('myService', function(){});

      var instance = new Second({myNamedParameter : {}});

      expect(instance._bound).toBeDefined();
      expect(instance._bound.myFactory).toBeDefined();
      expect(instance._bound.myService).toBeDefined();
      expect(instance._bound.myNamedParameter).toBeDefined();
      expect(instance._bound.fs).toBeDefined();
    });
    it("should not bind unwanted named properties to the instance", function () {
      var Second = First.extend({
        bindToInstance : true,
        dependencies : ['wanted']
      });
      var instance = new Second({wanted : 'wanted', unwanted : 'unwanted'});

      expect(instance.wanted).toBe('wanted');
      expect(instance.unwanted).toBeUndefined();
    });
  });
});

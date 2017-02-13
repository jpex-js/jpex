/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../jpex/grequire');

describe('Base Class - Invoke Parent', function(){
  var Base;
  
  beforeEach(function(){
    Base = grequire('.');
  });

  describe('Manual Calling', function(){
    it('should have an InvokeParent function', function(){
      var C = Base.extend();
      expect(typeof C.InvokeParent).toBe('function');
    });
    it('should invoke the parent constructor, and recalculate dependencies', function(){    
      var A = Base.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('A');
          
          this.Parent = true;
        }
      });
      A.Register.Constant('a', 'A');
      
      var B = A.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('B');
          B.InvokeParent(this);
          
          this.Child = true;
        }
      });
      B.Register.Constant('a', 'B');
      
      var instance = new B();
      expect(instance.Parent).toBe(true);
      expect(instance.Child).toBe(true);
    });
    it('should invoke the parent constructor using the child\'s arguments', function(){
      var A = Base.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('B');
          
          this.Parent = true;
        }
      });
      A.Register.Constant('a', 'A');
      
      var B = A.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('B');
          B.InvokeParent(this, arguments);
          
          this.Child = true;
        }
      });
      B.Register.Constant('a', 'B');
      
      var instance = new B();
      expect(instance.Parent).toBe(true);
      expect(instance.Child).toBe(true);
    });
    it('should invoke the parent constructor using custom arguments', function(){
      var A = Base.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('C');
          
          this.Parent = true;
        }
      });
      A.Register.Constant('a', 'A');
      
      var B = A.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('B');
          B.InvokeParent(this, arguments, {a : 'C'});
          
          this.Child = true;
        }
      });
      B.Register.Constant('a', 'B');
      
      var instance = new B();
      expect(instance.Parent).toBe(true);
      expect(instance.Child).toBe(true);
    });
  });
  
  describe('Auto calling', function(){
    it('should automatically invoke the parent before running the constructor', function(){
      var arr = [];
      var A = Base.extend(function(){
        arr.push('A');
      });
      var B = A.extend({
        invokeParent : true,
        constructor : function(){
          arr.push('B');
        }
      });
      
      new B();
      
      expect(arr.join('')).toBe('AB');
    });
    it('should automatically invoke the parent after running the constructor', function(){
      var arr = [];
      var A = Base.extend(function(){
        arr.push('A');
      });
      var B = A.extend({
        invokeParent : 'after',
        constructor : function(){
          arr.push('B');
        }
      });
      
      new B();
      
      expect(arr.join('')).toBe('BA');
    });
    it('should invoke the parent if no constructor is defined', function(){
      var arr = [];
      var A = Base.extend(function(){
        arr.push('A');
      });
      var B = A.extend();
      
      new B();
      
      expect(arr.join('')).toBe('A');
    });
    it('should not invoke the parent if no constructor is defined and inveokParent is false', function(){
      var arr = [];
      var A = Base.extend(function(){
        arr.push('A');
      });
      var B = A.extend({
        invokeParent : false
      });
      
      new B();
      
      expect(arr.join('')).toBe('');
    });
    it('should not invoke the parent if a constructor is defined but invokeParent is not set', function(){
      var arr = [];
      var A = Base.extend(function(){
        arr.push('A');
      });
      var B = A.extend(function(){
        arr.push('B');
      });
      var C = B.extend({
        constructor : function(){
          arr.push('C');
        }
      });
      
      new B();
      
      expect(arr.join('')).toBe('B');
      
      arr = [];
      
      new C();
      
      expect(arr.join('')).toBe('C');
    });
  });
  
  describe('Named Parameters', function(){
    it('should get named parameters', function(){
      var A = Base.extend({
        dependencies : ['a', 'b', {c : 'C'}],
        constructor : function(){
          var params = A.NamedParameters(this, arguments);
        }
      });
      
      var params = A.NamedParameters(['A', '', 'C'], {b : 'B'});
      var expected = {a : 'A', b : 'B', c : 'C'};
      
      expect(params).toEqual(expected);
    });
  });
});
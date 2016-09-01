/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../jpex/grequire');

describe('Base Class', function(){
  var BaseClass;
  
  beforeEach(function(){
    BaseClass = grequire('.');
  });
  
  it('should extend the base class into a new class', function(){
    var hasRun = false;
    var NewClass = BaseClass.extend(function(){
      hasRun = true;
    });
    expect(typeof NewClass).toBe('function');
    var instance = new NewClass();
    expect(hasRun).toBe(true);
  });
  it('should be an instance of its anscestors', function(){
    var A = BaseClass.extend();
    var B = A.extend();
    var C = B.extend();
    var D = BaseClass.extend();
    var instance = new C();
    
    expect(instance instanceof BaseClass).toBe(true);
    expect(instance instanceof A).toBe(true);
    expect(instance instanceof B).toBe(true);
    expect(instance instanceof C).toBe(true);
    expect(instance instanceof D).toBe(false);
  });
  it('should call the parent constructor if no constructor defined', function(){
    var hasBeenCalled = false;
    var Parent = BaseClass.extend(function(){
      hasBeenCalled = true;
    });
    var Child = Parent.extend();
    
    var instance = new Child();
    
    expect(hasBeenCalled).toBe(true);
  });
  it('should not call the parent constructor if a child constructor is defined', function(){
    var hasBeenCalled = false;
    var Parent = BaseClass.extend(function(){
      hasBeenCalled = true;
    });
    var Child = Parent.extend(function(){});
    
    var instance = new Child();
    
    expect(hasBeenCalled).toBe(false);
  });
  it('should contain prototype methods from the parent class', function(){
    var Parent = BaseClass.extend({
      prototype : {
        a : 'A',
        b : 'B'
      }
    });
    var Child = Parent.extend({
      prototype : {
        b : 'b',
        c : 'c'
      }
    });
    
    var instance = new Parent();
    expect(instance.a).toBe('A');
    expect(instance.b).toBe('B');
    
    instance = new Child();
    expect(instance.a).toBe('A');
    expect(instance.b).toBe('b');
    expect(instance.c).toBe('c');
  });
});
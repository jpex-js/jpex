describe('Base Class - Statics', function(){
  var BaseClass, Parent;

  beforeEach(function(){
    BaseClass = require('../../src').extend();
    Parent = BaseClass.extend();
  });

  it('should apply static members of the class', function(){
    var Child = Parent.extend({
      static : {
        a : 'A'
      }
    });
    expect(Child.a).toBe('A');
  });
  it('should inherit static members of the parent class', function(){
    var A = Parent.extend({
      static : {
        a : 'A',
        b : 'B'
      }
    });
    var B = A.extend({
      static : {
        b : 'b',
        c : 'c'
      }
    });

    expect(B.a).toBe('A');
    expect(B.b).toBe('b');
    expect(B.c).toBe('c');
  });
});

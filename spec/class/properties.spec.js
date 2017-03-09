describe("Properties", function () {
  var Jpex;
  beforeEach(function () {
    Jpex = require('../../src').extend();
  });

  it("should add standard property", function () {
    var x = Jpex.extend({ properties : 'foo' })();
    expect(Object.hasOwnProperty.call(x, 'foo')).toBe(true);
    expect(x.foo).toBeUndefined();
    x.foo = 'bah';
    expect(x.foo).toBe('bah');
  });
  it("should accept an object as standard property", function () {
    var x = Jpex.extend({ properties : { foo : [] }})();
    expect(Array.isArray(x.foo)).toBe(true);
  });
  it("should add a property with a default value", function () {
    var x = Jpex.extend({
      properties : {
        foo : 'bah'
      }
    })();

    expect(x.foo).toBe('bah');
    x.foo = 'foo';
    expect(x.foo).toBe('foo');
  });
  it("should add property with a value property", function () {
    var x = Jpex.extend({
      properties : {
        foo : { value : 'bah' }
      }
    })();

    expect(x.foo).toBe('bah');
    x.foo = 'foo';
    expect(x.foo).toBe('foo');
  });
  it("should not share the value between instances", function () {
    var Class = Jpex.extend({
      properties : {
        foo : {
          value : 'foo'
        }
      }
    });

    var x = new Class();
    expect(x.foo).toBe('foo');
    x.foo = 'bah';
    expect(x.foo).toBe('bah');

    var y = new Class();
    expect(x.foo).toBe('bah');
    expect(y.foo).toBe('foo');

    x.foo = 'a';
    y.foo = 'b';
    expect(x.foo).toBe('a');
    expect(y.foo).toBe('b');
  });
  it("should accept a default value function", function () {
    var x = Jpex.extend({
      properties : {
        foo : {
          default(){
            return {
              foo : 'foo'
            };
          }
        }
      }
    })();

    expect(x.foo.foo).toBe('foo');
  });
  it("should accept a getter method", function () {
    var x = Jpex.extend({
      properties : {
        foo : {
          get(value){
            return value.split('').reverse().join('').toUpperCase();
          }
        }
      }
    })();

    x.foo = 'abc';
    expect(x.foo).toBe('CBA');
    x.foo= 'def';
    expect(x.foo).toBe('FED');
  });
  it("should accept a setter method", function () {
    var x = Jpex.extend({
      properties : {
        foo : {
          set(value){
            return value.split('').reverse().join('').toUpperCase();
          }
        }
      }
    })();

    x.foo = 'abc';
    expect(x.foo).toBe('CBA');
    x.foo = x.foo;
    expect(x.foo).toBe('ABC');
  });
  it("should accept a watcher method", function () {
    var spy = jasmine.createSpy();
    var x = Jpex.extend({
      properties : {
        foo : {
          watch : spy
        }
      }
    })();

    expect(spy).not.toHaveBeenCalled();
    var y = x.foo;
    expect(spy).not.toHaveBeenCalled();
    y = x.foo = 'bah';

    expect(spy).toHaveBeenCalledWith('bah', undefined);

    x.foo = 'woo';
    expect(spy).toHaveBeenCalledWith('woo', 'bah');
  });
  it("should accept a combination of methods", function () {
    var spy = jasmine.createSpy();
    var x = Jpex.extend({
      properties : {
        foo : {
          value : 'initial',
          get(v){
            return v.toUpperCase();
          },
          set(v){
            return v.split('').reverse().join('');
          },
          watch : spy
        }
      }
    })();

    expect(x.foo).toBe('INITIAL');
    expect(spy).not.toHaveBeenCalled();
    x.foo = 'new value';
    expect(x.foo).toBe('EULAV WEN');
    expect(spy).toHaveBeenCalledWith('eulav wen', 'initial');
  });
  it("should accept a configurable property", function () {
    'use strict';

    var x = Jpex.extend({
      properties : {
        foo : {
          value : 'foo',
          configurable : false
        },
        bah : {
          value : 'bah',
          configurable : true
        },
        tu : {
          value : 'tu'
        }
      }
    })();

    expect(() => Object.defineProperty(x, 'foo', {value : 'oof'})).toThrow();
    expect(() => Object.defineProperty(x, 'bah', {value : 'hab'})).not.toThrow();
    expect(() => Object.defineProperty(x, 'tu', {value : 'ut'})).not.toThrow();
  });
  it("should accept a writable property", function () {
    'use strict';
    var x = Jpex.extend({
      properties : {
        foo : {
          value : 'foo',
          writable : false
        },
        bah : {
          value : 'bah',
          writable : true
        },
        tu : {
          value : 'tu'
        }
      }
    })();

    expect(() => x.foo = 'oof').toThrow();
    expect(() => x.bah = 'hab').not.toThrow();
    expect(() => x.tu = 'ut').not.toThrow();
  });
  it("should accept an enumerable property", function () {
    var x = Jpex.extend({
      properties : {
        foo : {
          value : 'foo',
          enumerable : false
        },
        bah : {
          value : 'bah',
          enumerable : true
        },
        tu : {
          value : 'tu'
        }
      }
    })();

    var keys = Object.keys(x);
    expect(keys.includes('foo')).toBe(false);
    expect(keys.includes('bah')).toBe(true);
    expect(keys.includes('tu')).toBe(true);
  });
  it("should accept a single watcher function", function () {
    var spy = jasmine.createSpy();
    var x = Jpex.extend({
      properties : {
        foo : spy
      }
    })();

    expect(x.foo).toBeUndefined();
    x.foo = 'foo';
    expect(x.foo).toBe('foo');
    expect(spy).toHaveBeenCalledWith('foo', undefined);
  });
  it("should inherit properties", function () {
    var Class = Jpex.extend({
      properties : {
        foo : 'foo'
      }
    });
    var Child = Class.extend();
    var x = new Child();

    expect(x.foo).toBe('foo');
  });
  it("should overwrite inherited properties", function () {
    var Class = Jpex.extend({
      properties : {
        foo : 'foo',
        bah : 'bah'
      }
    });
    var Child = Class.extend({
      properties : {
        foo : 'oof',
        tu : 'ut'
      }
    });
    var x = new Child();

    expect(x.foo).toBe('oof');
    expect(x.bah).toBe('bah');
    expect(x.tu).toBe('ut');
  });
});

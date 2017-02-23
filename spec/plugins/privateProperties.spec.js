describe("Plugins - privateProperties hook", function () {
  var Jpex, Class, fn, plugin, context;
  beforeEach(function () {
    Jpex = require('../../src').extend();

    fn = jasmine.createSpy().and.callFake(ctx => context = ctx);

    plugin = {
      name : 'private-properties',
      install : function ({on}) {
        on('privateProperties', fn);
      }
    };

    Jpex.use(plugin);

    Class = Jpex.extend();
  });

  it("should trigger a privateProperties event", function () {
    expect(fn).toHaveBeenCalled();
    expect(context).toBeTruthy();
  });
  it("should have an apply method", function () {
    expect(typeof context.apply).toBe('function');
  });
  it("should add non-enumerable properties", function () {
    fn.and.callFake(function ({apply}) {
      apply({
        fred : 'fred',
        bob : 'bob'
      });
    });

    Class = Jpex.extend();

    expect(Class.fred).toBe('fred');
    expect(Class.bob).toBe('bob');

    expect(Object.keys(Class).includes('fred')).toBe(false);
  });
  it("should be writable", function () {
    fn.and.callFake(function ({apply}) {
      apply({fred : 'fred'});
    });

    Class = Jpex.extend();

    expect(Class.fred).toBe('fred');
    Class.fred = 'bob';
    expect(Class.fred).toBe('bob');
  });
  it("should add getters and setters", function () {
    var x;

    fn.and.callFake(function ({apply}) {
      apply({
        fred : {
          get : () => x,
          set : v => x = v
        }
      });
    });

    Class = Jpex.extend();

    Class.fred = 'fred';
    expect(x).toBe('fred');
    expect(Class.fred).toBe('fred');
  });
});

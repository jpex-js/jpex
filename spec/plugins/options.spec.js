describe("Plugins - options hook", function () {
  var Jpex, Class, plugin, context, fn;
  beforeEach(function () {
    Jpex = require('../../src').extend();
    fn = jasmine.createSpy().and.callFake(ctx => context = ctx);
    plugin = {
      install : function ({on}) {
        on('options', fn);
      }
    };
    Jpex.use(plugin);
  });

  it("should trigger an options event", function () {
    Jpex.extend();
    expect(fn).toHaveBeenCalled();
    expect(context).toBeTruthy();
  });
  it("should have an options object", function () {
    Jpex.extend();
    expect(context.options).toBeDefined();
  });
  it("should have a merge function", function () {
    Jpex.extend();
    expect(context.merge).toBeDefined();
    expect(typeof context.merge).toBe('function');
  });
  it("should merge additional options together", function () {
    fn.and.callFake(function ({merge}) {
      merge({
        static : {
          foo : 'bah'
        }
      });
    });
    var Class = Jpex.extend();

    expect(Class.foo).toBe('bah');
    expect(Jpex.foo).toBeUndefined();
  });
  it("should mutate the options object", function () {
    fn.and.callFake(function ({options}) {
      options.static = options.static || {};
      options.static.foo = 'bah';
    });
    var Class = Jpex.extend();

    expect(Class.foo).toBe('bah');
    expect(Jpex.foo).toBeUndefined();
  });
});

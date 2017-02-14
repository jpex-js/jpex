describe("Plugins - factories hook", function () {
  var Jpex, Class, fn, context, plugin;
  beforeEach(function () {
    Jpex = require('../../src').extend();

    fn = jasmine.createSpy().and.callFake(ctx => context = ctx);

    plugin = {
      install : function ({on}) {
        on('factories', fn);
      }
    };

    Jpex.use(plugin);

    Class = Jpex.extend();
  });

  it("should trigger a factories event", function () {
    expect(fn).toHaveBeenCalled();
  });
  it("should have a register function", function () {
    expect(typeof context.register).toBe('function');
  });
  it("should register a new function type", function () {
    var fn2 = jasmine.createSpy();
    context.register('thingy', fn2);

    expect(Class.register.thingy).toBeDefined();
    expect(Jpex.register.thingy).not.toBeDefined();

    Class.register.thingy();

    expect(fn2).toHaveBeenCalled();
  });
});

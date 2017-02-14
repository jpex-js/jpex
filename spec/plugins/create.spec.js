describe("Plugins - created hook", function () {
  var Jpex, Class, plugin, context, fn;
  beforeEach(function () {
    Jpex = require('../../src').extend();

    fn = jasmine.createSpy().and.callFake(ctx => context = ctx);
    fn2 = jasmine.createSpy();

    plugin = {
      install : function ({Jpex, on}) {
        Jpex.register.constant('foo', 'bah');
        on('created', fn);
      }
    };

    Jpex.use(plugin);

    Class = Jpex.extend({
      dependencies : 'foo',
      constructor : fn2
    });
  });

  it("should trigger an event", function () {
    expect(fn).not.toHaveBeenCalled();
    Class();
    expect(fn).toHaveBeenCalled();
    expect(context).toBeTruthy();
  });
  it("should have a refernece to the instance", function () {
    var i = Class();
    expect(context.instance).toBeDefined();
    expect(context.instance).toBe(i);
  });
  it("should have a reference to the arguments", function () {
    Class();
    expect(context.args).toBeDefined();
    expect(context.options.dependencies[0]).toBe('foo');
    expect(context.args[0]).toBe('bah');
  });
  it("should trigger the event AFTER calling the constructor", function () {
    fn.and.callFake(function () {
      expect(fn2).toHaveBeenCalled();
    });
    Class();
    expect(fn).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });
});

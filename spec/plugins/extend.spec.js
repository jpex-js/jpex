describe("Plugins - extend hook", function () {
  var Jpex, Class, plugin, context;
  beforeEach(function () {
    context = null;
    delete require.cache[require.resolve('../../src')];
    Jpex = require('../../src').extend();

    plugin = {
      install : function (options) {
        options.on('extend', function (ctx) {
          context = ctx;
        });
      }
    };

    Jpex.use(plugin);
    Class = Jpex.extend();
  });

  it("should trigger the extend event", function () {
    expect(context).toBeTruthy();
  });
  it("should contain a reference to the Class", function () {
    expect(context.Class).toBe(Class);
  });
  it("should contain a reference to the original Class the plugin was registered on", function () {
    var SubClass = Class.extend();
    expect(context.Class).toBe(SubClass);
    expect(context.Jpex).toBe(Jpex);
  });
  it("should contain a reference to the event name", function () {
    expect(context.eventName).toBe('extend');
  });
  it("should contain a reference to the options object", function () {
    expect(context.options).toBeDefined();
  });

  it("should allow multiple hooks to be set", function () {
    context = null;
    var calls = 0;
    Class.use({
      install : function ({on}) {
        on('extend', () => calls++);
        on('extend', () => calls++);
      }
    });
    var SubClass = Class.extend();

    expect(context).toBeTruthy();
    expect(calls).toBe(2);
  });
  it("should inherit hooks, but they should not propagate up the chain", function () {
    var calls = 0;
    Class.use({
      install : function ({on}) {
        on('extend', () => calls++);
        on('extend', () => calls++);
      }
    });
    var SubClass = Class.extend();

    expect(calls).toBe(2);

    context = null;

    Jpex.extend();
    expect(context).toBeTruthy();
    expect(calls).toBe(2);
  });
});

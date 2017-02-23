describe("Plugins - install", function () {
  var Jpex, plugin;
  beforeEach(function () {
    Jpex = require('../../src').extend();
    plugin = {
      name : 'spec-plugin',
      silent : true,
      install : jasmine.createSpy()
    };
  });

  it("should error if name does not exist", function () {
    expect(() => Jpex.use({install : () => {}})).toThrow();
  });
  it("should error if no install method exists", function () {
    expect(() => Jpex.use()).toThrow();
    expect(() => Jpex.use({name : 'x'})).toThrow();
    expect(() => Jpex.use({install : {}, name : 'x'})).toThrow();
    expect(() => Jpex.use({install : () => {}, name : 'x'})).not.toThrow();
  });

  it("should call the install method", function (done) {
    plugin.install = done;
    Jpex.use(plugin);
  });

  it("should contain a reference to the Jpex object", function (done) {
    plugin.install.and.callFake(function (options) {
      expect(options.Jpex).toBe(Jpex);
      done();
    });
    Jpex.use(plugin);
  });
  it("should contain an on function", function (done) {
    plugin.install.and.callFake(function (options) {
      expect(options.on).toBeDefined();
      expect(typeof options.on).toBe('function');
      done()
    });
    Jpex.use(plugin);
  });
  it("should not install a plugin twice", function () {
    Jpex.use(plugin);
    expect(plugin.install.calls.count()).toBe(1);
    Jpex.use(plugin);
    Jpex.use(plugin);
    expect(plugin.install.calls.count()).toBe(1);
  });
  it("should install a plugin if reuse is set", function () {
    plugin.reuse = true;
    Jpex.use(plugin);
    Jpex.use(plugin);
    Jpex.use(plugin);
    expect(plugin.install.calls.count()).toBe(3);
  });
});

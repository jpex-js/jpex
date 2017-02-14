describe("Plugins - install", function () {
  var Jpex, plugin;
  beforeEach(function () {
    Jpex = require('../../src').extend();
    plugin = {
      install : jasmine.createSpy()
    };
  });

  it("should error if no install method exists", function () {
    expect(() => Jpex.use()).toThrow();
    expect(() => Jpex.use({})).toThrow();
    expect(() => Jpex.use({install : {}})).toThrow();
    expect(() => Jpex.use({install : () => {}})).not.toThrow();
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
});

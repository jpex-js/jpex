describe("Jpex.$clearCache", function () {
  var Jpex;
  beforeEach(function () {
    Jpex = require('../../src').extend();
  });
  it("should set a factory to resolved once resolved", function () {
    Jpex.register.factory('instance', function () {
      return {};
    }).lifecycle.application();
    expect(Jpex.$$factories.instance.resolved).toBeFalsy();
    Jpex.$resolve('instance');
    expect(Jpex.$$factories.instance.resolved).toBe(true);
  });
  it("should clear the cache", function () {
    Jpex.register.factory('instance', function () {
      return {};
    }).lifecycle.application();
    expect(Jpex.$$factories.instance.resolved).toBeFalsy();
    Jpex.$resolve('instance');
    expect(Jpex.$$factories.instance.resolved).toBe(true);
    Jpex.$clearCache();
    expect(Jpex.$$factories.instance.resolved).toBe(false);
  });
  it("should return a new instance once the cache is cleared", function () {
    Jpex.register.factory('instance', function () {
      return {};
    }).lifecycle.application();
    var a = Jpex.$resolve('instance');
    var b = Jpex.$resolve('instance');
    Jpex.$clearCache();
    var c = Jpex.$resolve('instance');
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
  it("should clear specific factories", function () {
    Jpex.register.factory('a', () => ({})).lifecycle.application();
    Jpex.register.factory('b', () => ({})).lifecycle.application();
    Jpex.register.factory('c', () => ({})).lifecycle.application();
    Jpex.$resolve('a');
    Jpex.$resolve('b');
    Jpex.$resolve('c');

    expect(Jpex.$$factories.a.resolved).toBe(true);
    expect(Jpex.$$factories.b.resolved).toBe(true);
    expect(Jpex.$$factories.c.resolved).toBe(true);

    Jpex.$clearCache(['a', 'b']);

    expect(Jpex.$$factories.a.resolved).toBe(false);
    expect(Jpex.$$factories.b.resolved).toBe(false);
    expect(Jpex.$$factories.c.resolved).toBe(true);
  });
});

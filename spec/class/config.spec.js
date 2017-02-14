describe("Config", function () {
  var Jpex, Class;
  beforeEach(function () {
    Jpex = require('../../src').extend();
    Jpex.register.constant('test', 'test');
  });

  it("should use config to set default options", function () {
    Class = Jpex.extend({
      dependencies : 'test',
      config : {
        bindToInstance : '$deps',
        static : {
          foo : 'bah'
        }
      }
    });
    expect(Class.foo).toBe('bah');
    expect(Class().$deps.test).toBe('test');
  });
  it("should override config with actual options", function () {
    Class = Jpex.extend({
      dependencies : 'test',
      bindToInstance : '$bob',
      static : {
        foo : 'zoo'
      },
      config : {
        bindToInstance : '$deps',
        static : {
          foo : 'bah'
        }
      }
    });

    expect(Class.foo).toBe('zoo');
    expect(Class().$bob.test).toBe('test');
    expect(Class().$deps).toBeUndefined();
  });
  it("should inherit configs", function () {
    var Parent = Jpex.extend({
      config : {
        bindToInstance : '$deps'
      }
    });
    var Child = Parent.extend({
      config : {
        dependencies : 'test'
      }
    });
    Class = Child.extend();

    expect(Class().$deps.test).toBe('test');
  });
});

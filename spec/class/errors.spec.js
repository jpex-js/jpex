describe("Error Handling", function () {
  var Class;
  beforeEach(function () {
    Class = require('../../src').extend(function () {
      throw new Error('An error');
    });
  });

  it("should use $errorHandler to catch errors", function () {
    var m;
    Class.register.factory('$log', function () {
      return function (message) {
        m = message;
      };
    });
    Class.register.factory('$errorHandler', function ($log) {
      return function (e) {
        $log(e.message);
      };
    });

    expect(() => Class()).not.toThrow();
    expect(m).toBe('An error');
  });
});

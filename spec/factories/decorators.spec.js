describe("Decorators", function () {
  var Jpex, Class, constants;
  beforeEach(function () {
    constants = require('../../src/constants');
    Jpex = require('../../src').extend();
    Jpex.register.service('logger', function () {
      this.log = function(){
        // console.log('!');
      };
    });
    Class = Jpex.extend(function (logger) {
      logger.log();
    });
  });

  it("should decorate a factory", function () {
    var spy = jasmine.createSpy();
    Jpex.register.decorator('logger', function (logger) {
      logger.log = spy;
      return logger;
    });
    Class();
    expect(spy).toHaveBeenCalled();
  });

  it("should allow multiple decorators", function () {
    var spy1, spy2;

    Jpex.register.decorator('logger', function (logger) {
      spy1 = spyOn(logger, 'log');
      return logger;
    });
    Jpex.register.decorator('logger', function (logger) {
      spy2 = jasmine.createSpy();
      logger.log.and.callFake(spy2);
      return logger;
    });
    Class();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });
  it("should not add decorators to parent classes", function () {
    var spy = jasmine.createSpy();
    var Class2 = Class.extend({
      dependencies : 'logger',
      invokeParent : true
    });

    Class2.register.decorator('logger', function (logger) {
      logger.log = spy;
      return logger;
    });

    expect(spy).not.toHaveBeenCalled();
    Jpex();
    expect(spy).not.toHaveBeenCalled();
    Class();
    expect(spy).not.toHaveBeenCalled();
    Class2();
    expect(spy).toHaveBeenCalled();
  });
  it("should clear the factory cache (application)", function () {
    Jpex.$$factories.logger.lifecycle = constants.APPLICATION;
    var logger = Jpex.$resolve('logger');
    var spy = jasmine.createSpy();

    expect(Class.$resolve('logger')).toBe(logger);
    Class.register.decorator('logger', function (logger) {
      logger.log = spy;
      return logger;
    });
    // Should create a new logger with the decorated value
    expect(Class.$resolve('logger')).not.toBe(logger);
    // Should go back to being cached
    logger = Class.$resolve('logger');
    expect(Class.$resolve('logger')).toBe(logger);

    logger.log();
    expect(spy).toHaveBeenCalled();
  });

  it("should clear the factory cache (class)", function () {
    Jpex.$$factories.logger.lifecycle = constants.CLASS;
    var logger = Class.$resolve('logger');
    var spy = jasmine.createSpy();

    expect(Class.$resolve('logger')).toBe(logger);
    Class.register.decorator('logger', function (logger) {
      logger.log = spy;
      return logger;
    });
    // Should create a new logger with the decorated value
    expect(Class.$resolve('logger')).not.toBe(logger);
    // Should go back to being cached
    logger = Class.$resolve('logger');
    expect(Class.$resolve('logger')).toBe(logger);

    logger.log();
    expect(spy).toHaveBeenCalled();
  });
});

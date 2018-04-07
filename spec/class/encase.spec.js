describe('encase', function(){
  var Jpex;
  beforeEach(function () {
    Jpex = require('../../src').extend();
  });

  it('should encase a method with specified dependencies', function () {
    Jpex.register.constant('FOO', 'injected');
    const fn = Jpex.$encase([ 'FOO' ], (foo) => (bah) => (foo + bah));

    const result = fn('provided');

    expect(result).toBe('injectedprovided');
  });

  it('infers dependencies from function arguments', function () {
    Jpex.register.constant('FOO', 'injected');
    const fn = Jpex.$encase((FOO) => (bah) => (FOO + bah));

    const result = fn('provided');

    expect(result).toBe('injectedprovided');
  });
});

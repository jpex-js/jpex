describe('Jpex - Default Factories', function(){
  describe('$resolve', function(){
    var BaseClass, $resolve;

    beforeEach(function(){
      BaseClass = require('../../src').extend(function(_$resolve_){
        $resolve = _$resolve_;
      });
      BaseClass();
    });

    it('should resolve a dependency', function () {
      var path = $resolve('path');

      expect(path).toBeDefined();
    });

    it('should resolve a dependency on the current class', function () {
      BaseClass.register.constant('foo', 'bah');
      var foo = $resolve('foo');
      expect(foo).toBe('bah');
    });

    it('should be able to resolve itself!', function () {
      var r = $resolve('$resolve');
      expect(r).toBe($resolve);
    });

    it('should error if dependency cannot be resolved', function () {
      expect(() => $resolve('blugh')).toThrow();
    });

    it('should accept named parameters', function () {
      var test = $resolve('foo', {foo : 'bah'});
      expect(test).toBe('bah');
    });

    it("should be available statically", function () {
      var path = BaseClass.$resolve('path');
      expect(path).toBeDefined();
    });

    it("should resolve multiple dependencies", function () {
      var deps = $resolve(['path', 'fs']);
      expect(deps.length).toBe(2);
      expect(deps[0].dirname).toBeDefined();
      expect(deps[1].readFile).toBeDefined();
    });

    it("should resolve multiple dependencies statically", function () {
      var deps = BaseClass.$resolve(['path', 'fs']);
      expect(deps.length).toBe(2);
      expect(deps[0].dirname).toBeDefined();
      expect(deps[1].readFile).toBeDefined();
    });
    it("should have access to the class instance's named parameters", function () {
      $resolve = null;
      BaseClass({namedDependency : 123456});
      var result = $resolve('namedDependency');
      expect(result).toBe(123456);
    });
  });
});

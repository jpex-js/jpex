/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Jpex - Default Factories', function(){
  describe('$require', function(){
    var BaseClass, $require;

    beforeEach(function(){
      BaseClass = grequire('.').extend(function(_$require_){
        $require = _$require_;
      });
      new BaseClass();
    });
    
    it('should wrap require', function(){
      expect($require).toBeDefined();
      expect(typeof $require).toBe('function');
    });
    
    it('should require stuff', function(){
      var result = $require('lib/defaults/require');
      expect(result).toBeDefined();
    });
  });
});
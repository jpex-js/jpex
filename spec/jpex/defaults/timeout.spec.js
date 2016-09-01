/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Jpex - Default Factories', function(){
  describe('$timeout', function(){
    var BaseClass, $timeout, $interval, $immediate, $tick;

    beforeEach(function(){
      BaseClass = grequire('.').extend(function(_$timeout_, _$interval_, _$immediate_, _$tick_){
        $timeout = _$timeout_;
        $interval = _$interval_;
        $immediate = _$immediate_;
        $tick = _$tick_;
      });
      new BaseClass();
    });
    
    it('should inject a timeout', function(){
      expect($timeout).toBe(setTimeout);
      expect($immediate).toBe(setImmediate);
      expect($interval).toBe(setInterval);
      expect($tick).toBe(process.nextTick);
    });
  });
});
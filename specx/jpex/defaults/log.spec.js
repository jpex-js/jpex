/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Jpex - Default Factories', function(){
  describe('$log', function(){
    var BaseClass, $log;

    beforeEach(function(){
      $log = null;
      BaseClass = grequire('.').extend(function(_$log_){
        $log = _$log_;
      });
      new BaseClass();
    });
    
    it('should wrap the Console', function(){

        expect($log).toBeDefined();
        expect($log.log).toBe(console.log);
        expect($log.warn).toBe(console.warn);
        expect($log.error).toBe(console.error);
      
        spyOn(console, 'log');
        $log('direct');
      
        expect(console.log).toHaveBeenCalledWith('direct');
    });
  });
});
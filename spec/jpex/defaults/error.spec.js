/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Jpex - Default Factories', function(){
  describe('$error', function(){
    var BaseClass, $error;

    beforeEach(function(){
      BaseClass = grequire('.').extend(function(_$error_){
        $error = _$error_;
      });
      new BaseClass();
    });
    
    describe('Define', function(){
      it('should have a standard error defined');
      it('should be an instance of Error');
      it('should create a new Error');
      it('should attach the new Error to the factory');
    });

    describe('Create', function(){});
    
    describe('Throw ', function(){
      it('should throw an error');
      it('should throw a specific error using .throw()');
      it('should throw an error using throw ...');
      it('should override the standard error to be thrown');
    });
  });
});
/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Jpex - Default Factories', function(){
  describe('$typeof', function(){
    var BaseClass, $typeof;

    beforeEach(function(){
      BaseClass = grequire('.').extend(function(_$typeof_){
        $typeof = _$typeof_;
      });
      new BaseClass();
    });

    it('should return the type of a primitive', function () {
      var arr = [
        [123, 'number'],
        ['str', 'string'],
        [true, 'boolean'],
        [function(){}, 'function'],
        [() => {}, 'function'],
        [/abcdefg/ig, 'regexp'],
        [new Date(), 'date']
      ];

      arr.forEach(function (el) {
        expect($typeof(el[0])).toBe(el[1]);
      });
    });
    it('should return the type of an array', function () {
      var arr = [
        [],
        new Array(4)
      ];

      arr.forEach(function (el) {
        expect($typeof(el)).toBe('array');
      });
    });
    it('should return the type of an object', function () {
      expect($typeof({})).toBe('object');
    });
    it('should return the type of a constructed primitive', function () {
      var arr = [
        [new Number(123), 'number'],
        [new String('str'), 'string'],
        [new Boolean(true), 'boolean'],
        [new RegExp('abcdef'), 'regexp'],
      ];

      arr.forEach(function (el) {
        expect($typeof(el[0])).toBe(el[1]);
      });
    });
    it('should return object for classes', function () {
      var arr = [
        Math,
        JSON,
        new ReferenceError()
      ];

      arr.forEach(function (el, i) {

        expect($typeof(el)).toBe('object');
      });
    });
    it('should return the type of a class (Math/JSON/Error)', function () {
      var arr = [
        [Math, 'math'],
        [JSON, 'json'],
        [new ReferenceError(), 'error']
      ];

      arr.forEach(function (el) {
        expect($typeof(el[0], true)).toBe(el[1]);
      });
    });
  });
});

/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Jpex - Default Factories', function(){
  describe('$copy', function(){
    var BaseClass, $copy;

    beforeEach(function(){
      BaseClass = grequire('.').extend(function($icopy){
        $copy = $icopy;
      });
      new BaseClass();
    });

    it('should copy a primitive', function () {
      expect($copy('abcd')).toBe('abcd');
    });
    it('should copy a date', function () {
      var d = new Date();
      var d2 = $copy(d);

      expect(d).not.toBe(d2);
      expect(d2 instanceof Date).toBe(true);
      expect(d.toString()).toBe(d2.toString());
    });
    it('should copy a regular expression', function () {
      var r = /abd/g;
      var r2 = $copy(r);

      expect(r).not.toBe(r2);
      expect(r).toEqual(r2);
      expect(r2.global).toBe(true);
      expect(r2.ignoreCase).not.toBe(true);
    });
    it('should copy an array', function () {
      var arr = ['a', 'b', 'c', 'd'];
      var arr2 = $copy(arr);

      expect(arr2).not.toBe(arr);
      expect(arr2).toEqual(arr);
    });
    it('should copy an object', function () {
      var o = {
        a : 'apple',
        b : 'bean'
      };
      var o2 = $copy(o);

      expect(o2).not.toBe(o);
      expect(o2).toEqual(o);
    });
    it('should not copy sub properties of an object', function () {
      var o = { obj : {} };
      var o2 = $copy.shallow(o);

      expect(o2).not.toBe(o);
      expect(o2).toEqual(o);
      expect(o2.obj).toBe(o.obj);
    });

    it('should deep copy an array', function () {
      var arr = [
        [1, 2, 3],
        { obj : {} },
        'string'
      ];
      var arr2 = $copy.deep(arr);

      expect(arr2).not.toBe(arr);
      expect(arr2[0]).not.toBe(arr[0]);
      expect(arr2[1]).not.toBe(arr[1]);
      expect(arr2).toEqual(arr);
    });
    it('should deep copy an object', function () {
      var o = { obj : {} };
      var o2 = $copy.deep(o);

      expect(o2).not.toBe(o);
      expect(o2).toEqual(o);
      expect(o2.obj).not.toBe(o.obj);
      expect(o2.obj).toEqual(o.obj);
    });

    it('should copy multiple objects into a target object', function () {
      var o1 = {a : 'first'};
      var o2 = {a : 'second', b : 'second'};
      var o3 = {b : 'third', c : 'third'};
      var o4 = {b : 'fourth', d : 'fourth'};

      var o5 = $copy.extend(o1, o2, o3, o4);

      expect(o5.a).toBe('second');
      expect(o5.b).toBe('fourth');
      expect(o5.c).toBe('third');
      expect(o5.d).toBe('fourth');
    });
    it('should mutate the target', function () {
      var o1 = {a : 'first'};
      var o2 = {a : 'second', b : 'second'};
      var o3 = {b : 'third', c : 'third'};
      var o4 = {b : 'fourth', d : 'fourth'};

      var o5 = $copy.extend(o1, o2, o3, o4);

      expect(o5).toBe(o1);
    });
    it('should deep copy', function () {
      var o1 = { obj : {
        x : 'first'
      } };
      var o2 = { obj : {
        x : 'second'
      } };
      $copy.extend(o1, o2);

      expect(o1.obj.x).toBe('second');
    });
    it('should combine objects', function () {
      var o1 = {obj : {a : 'first'}};
      var o2 = {obj : {b : 'second'}};
      var o3 = {obj : {c : 'third'}};
      $copy.extend(o1, o2, o3);

      expect(o1.obj.a).toBe('first');
      expect(o1.obj.b).toBe('second');
      expect(o1.obj.c).toBe('third');
    });
  });
});

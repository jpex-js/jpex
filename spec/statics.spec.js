/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../jpex/grequire');

describe('Base Class - statics', function(){
  var Base;
  
  beforeEach(function(){
    Base = grequire('.');
  });
  
  describe('Copy', function(){
    it('should copy an object', function(){
      var obj = {
        o : {
          a : [
            /abc/gi,
            'string',
            3,
            null,
            undefined,
            new Date(),
            function(){}
          ]
        }
      };
      var obj2 = Base.Copy(obj);
      
      expect(obj2).toEqual(obj);
    });
  });
});
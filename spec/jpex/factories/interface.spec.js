/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Interfaces', function(){
  var Base;
  
  beforeEach(function(){
    Base = grequire('.').extend(function(test){});
  });
  
  it('should reigster an interface', function(){
    var obj = {};
    Base.Register.Interface('test', () => obj);
    
    expect(Base._interfaces.test).toBeDefined();
    expect(Base._interfaces.test).toBe(obj);
  });
  
  it('should ensure the type matches on an interface', function(){
    var arr = [
      {i : '', o : 'string'},
      {i : 1, o : 444},
      {i : {}, o : {}},
      {i : [], o : []},
      {i : new Date(), o : new Date()},
      {i : new RegExp(), o : /abc/},
      {i : null, o : null}
    ];
    
    arr.forEach(a => {
      Base.Register.Interface('test', () => ({any : a.i}));
      Base.Register.Constant('test', {any : a.o});
      new Base();
    });
    
    arr = [
      {i : '', o : {}},
      {i : 1, o : 'string'},
      {i : {}, o : []},
      {i : [], o : {}},
      {i : new Date(), o : {}},
      {i : new RegExp(), o : Object.create({})},
      {i : null, o : 'string'}
    ];
    
    arr.forEach(a => {
      var err;
      Base.Register.Interface('test', () => ({any : a.i}));
      Base.Register.Constant('test', {any : a.o});
      try{
        new Base();
      }catch(e){
        err = e;
      }finally{
        expect(err).toBeDefined();
      }
    });
  });
  
  it('should check that all properties of an object match', function(){
    Base.Register.Interface('test', () => ({a : [], b : {}, c : 'string'}));
    var Class = Base.extend(function(test){});
    
    new Class({
      test : {
        a : [1, 2, 3],
        b : {dont : true, care : true},
        c : 'text'
      }
    });
    
    expect(function(){
      new Class({
        test : {
          a : [],
          b : {}
        }
      });
    }).toThrow();
  });
  
  it('should allow an empty array on the interface', function(){
    Base.Register.Interface('test', () => []);
    
    new Base({test : []});
    new Base({test : [1, 2, 3]});
    new Base({test : ['a']});
    
    expect(function(){
      new Base({test : {}});
    }).toThrow();
  });
  
  it('should allow an empty array on the module', function(){
    Base.Register.Interface('test', () => [1]);
    
    new Base({test : []});
    
    expect(function(){
      new Base({test : [null]});
    }).toThrow();
  });
  
  it('should check that all array elements match the pattern', function(){
    Base.Register.Interface('test', () => [1]);
    
    new Base({test : [1, 2, 3, 4]});
    
    expect(function(){
      new Base({test : [1, 2, 3, '4']});
    }).toThrow();
  });
  
  it('should handle nested properties', function(){
    Base.Register.Interface('test', () => [
      {
        prop : {
          arr : [
            {
              val : true
            }
          ]
        }
      }
    ]);
    
    Base.Register.Factory('test', function(){
      return [{
        prop : {
          arr : [
            {
              val : false
            }
          ]
        }
      }];
    });
    
    new Base();
    
    expect(function(){
      new Base({test : [
        {
          prop : {
            arr : [
              {
                val : 'true'
              }
            ]
          }
        }
      ]});
    }).toThrow();
  });
  
  it('should have a utlity object with primitive types', function(){
    Base.Register.Interface('test', i => {
      return {
        a : i.string,
        b : i.number,
        c : i.boolean,
        d : i.null,
        e : i.object,
        f : i.array,
        g : i.function
      };
    });
    Base.Register.Constant('test', {
      a : 'string',
      b : 1234,
      c : true,
      d : null,
      e : {},
      f : [],
      g : () => {}
    });
    
    new Base();
  });
  
  it('should allow any value', function(){
    Base.Register.Interface('test', i => ({
      any : i.any()
    }));
    
    new Base({test : {any : 'string'}});
  });
  
  it('should allow different type', function(){
    Base.Register.Interface('test', function(i){
      return {
        either : i.either(i.string, i.number, i.array)
      };
    });
    
    var arr = ['string', 1234, [{}]];
    
    arr.forEach(function(a){
      new Base({test : {either : a}});
    });
    
    expect(function(){
      new Base({test : {either : {}}});
    }).toThrow();
  });
  
  it('should create an array of a specific type', function(){
    Base.Register.Interface('test', i => ({
      arr : i.arrayOf('')
    }));
    Base.Register.Constant('test', {arr : []});
    
    new Base({test : {arr : []}});
    new Base({test : {arr : ['string', 'strong']}});
    
    expect(function(){
      new Base({test : {arr : ['string', function(){}]}});
    }).toThrow();
  });
  it('should work with the EITHER method', function(){
    Base.Register.Interface('test', i => ({
      arr : i.arrayOf(i.string, i.function, i.object)
    }));
    new Base({test : {arr : ['string', function(){}, {}]}});
  });
  
  it('should give meaningful errors', function(){
    Base.Register.Interface('test', () => 'string');
    Base.Register.Constant('test', 123);
    
    var message;
    try{
      new Base();
    }catch(e){
      message = e.message;
    }finally{
      expect(message.indexOf('test')).toBeGreaterThan(-1);
      expect(message.indexOf('Not a string')).toBeGreaterThan(-1);
    }
    
    message = null;
    Base.Register.Interface('test', i => i.either(i.string, i.null, i.function));
    
    try{
      new Base();
    }catch(e){
      message = e.message;
    }finally{
      expect(message.indexOf('test')).toBeGreaterThan(-1);
      expect(message.indexOf('string/null/function')).toBeGreaterThan(-1);
    }
  });
});
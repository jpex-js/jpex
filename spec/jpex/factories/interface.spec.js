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
  
  it('should allow any value as a null interface', function(){
    Base.Register.Interface('test', () => ({any : null}));
    Base.Register.Factory('test', () => ({any : 1234}));
    
    new Base();
  });
  
  it('should ensure the type matches on an interface', function(){
    var arr = [
      {i : '', o : 'string'},
      {i : 1, o : 444},
      {i : {}, o : {}},
      {i : [], o : []},
      {i : new Date(), o : new Date()},
      {i : new RegExp(), o : /abc/}
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
      {i : new RegExp(), o : Object.create({})}
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
  });
});
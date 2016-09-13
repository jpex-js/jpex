/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Interfaces', function(){
  var Base;
  
  beforeEach(function(){
    Base = grequire('.').extend(function(test){});
  });
  
  describe('Register', function(){
    it('should reigster an interface', function(){
      var obj = {};
      Base.Register.Interface('test', () => obj);

      expect(Base._interfaces.test).toBeDefined();
      expect(Base._interfaces.test.pattern).toBe(obj);
    });
  });
  
  describe('Type checking', function(){
    it('should ensure the type matches on an interface', function(){
      var arr = [
        {i : '', o : 'string'},
        {i : 1, o : 444},
        {i : {}, o : {}},
        {i : [], o : []},
        {i : new Date(), o : new Date()},
        {i : new RegExp(), o : /abc/},
        {i : null, o : null},
        {i : () => {}, o : () => {}}
      ];

      arr.forEach(a => {
        Base.Register.Interface('test', () => ({any : a.i}));
        Base.Register.Constant('test', {any : a.o}, 'test');
        new Base();
      });

      arr = [
        {i : '', o : {}},
        {i : 1, o : 'string'},
        {i : {}, o : []},
        {i : [], o : {}},
        {i : new Date(), o : {}},
        {i : new RegExp(), o : Object.create({})},
        {i : null, o : 'string'},
        {i : function(){}, o : {}}
      ];

      arr.forEach(a => {
        var err;
        Base.Register.Interface('test', () => ({any : a.i}));
        Base.Register.Constant('test', {any : a.o}, 'test');
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
      }, 'test');

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
    
    it('should create a function with properties', function(){
      Base.Register.Interface('test', i => i.functionWith({a : i.number}));
      
      var fn = function(){};
      fn.a = 123;
      
      new Base({test : fn});
      
      expect(function(){
        new Base({test : function(){}});
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
  
  describe('Resolving', function(){
    var service, Class;
    beforeEach(function(){
      service = undefined;
      
      Base = grequire('.').extend(function(){});
      Base.Register.Interface('iService', function(i){
        return {
          a : i.any()
        };
      });
      
      Class = Base.extend({
        dependencies : 'iService',
        constructor : function(s){
          service = s;
        }
      });
    });
    
    it('should resolve a factory using an interface', function(){
      Class.Register.Factory('factory', function(){
        return {a : 'hola'};
      }, 'iService');
      new Class();
      
      expect(service.a).toBe('hola');
      
      
      Class._factories.factory.interface[0] = 'iOther';
      
      expect(() => (new Class())).toThrow();
    });
    it('should resolve a constant using an interface', function(){
      Class.Register.Constant('constant', {a : 'yo'}, 'iService');
      new Class();
      
      expect(service.a).toBe('yo');
      
      Class._factories.constant.interface = [];
      
      expect(() => (new Class())).toThrow();
    });
    it('should resolve a named parameter using an interface', function(){
      Class.Register.Constant('named', {a : 'hi'}, 'iService');
      var obj = {a : 'sup'};
      
      new Class({iService : obj});
      
      expect(service.a).toBe('sup');
    });
    it('should resolve a named parameter that matches the name but not the interface', function(){
      Class.Register.Constant('named', {a : 'hi'}, 'iService');
      var obj = {a : 'howdy'};
      
      new Class({named : obj});
      
      expect(service.a).toBe('howdy');
    });
    it('should ignore a named parameter if it does not match the interface', function(){
      Class.Register.Constant('named', {a : 'hi'}, 'iService');
      var obj = {a : 'howdy'};
      
      new Class({other : obj});
      
      expect(service.a).toBe('hi');
    });
    it('should resolve a Jpex Class Service using an interface', function(){
      var Service = Base.extend(function(){
        this.a = 'hey';
      });
      
      Base.Register.Service('service', Service, ['iService']);
      
      new Class();
      
      expect(service.a).toBe('hey');
    });
    it('should resolve a Jpex Class that has its own interfaces defined', function(){
      var Service = Base.extend({
        interface : 'iService',
        prototype : {
          a : 'ahoy'
        }
      });
      
      Base.Register.Service('service', Service);
      
      new Class();
      
      expect(service.a).toBe('ahoy');
    });
    
    it('it should resolve a factory that has spurious interfaces', function(){
      Class.Register.Factory('factory', function(){
        return {a : 'salut'};
      }, ['iApple', 'iService', 'iPod']);
      new Class();
      
      expect(service.a).toBe('salut');
    });
    it('should resolve a factory by referring to it directly and not the interface', function(){
      Class = Base.extend({
        dependencies : 'factory',
        constructor : function(s){
          service = s;
        }
      });
      Class.Register.Factory('factory', function(){
        return 'hello';
      }, 'iService');
      
      new Class();
      
      expect(service).toBe('hello');
    });
    it('should resolve an interface with nested interfaces', function(){
      Class.Register.Interface('iService', i => ({a : i.any()}), 'iFactory');
      Class.Register.Interface('iFactory', i => ({b : i.any()}), 'iObject');
      Class.Register.Interface('iObject', i => ({c : i.any()}));
      
      expect(function(){
        new Class({iService : {a : true}});
      }).toThrow();
      
      expect(function(){
        new Class({iService : {a : true, b : true,}});
      }).toThrow();
      
      expect(function(){
        new Class({iService : {a : true, c : true}});
      }).toThrow();
      
      new Class({iService : {a : true, b : true, c : true}});
    });
    
    it('should resolve a factory that uses an interface that another interface derives from', function(){
      Class.Register.Interface('IObject', i => i.either(i.object, i.array));
      Class.Register.Interface('IEnumerable', () => [], 'IObject');
      Class.Register.Interface('IArray', () => [], 'IEnumerable');
      Class.Register.Interface('IArray<Number>', i => [i.number], 'IArray');
      
      Class.Register.Constant('NumberArray', [1, 2, 3], 'IArray<Number>');
      
      var Child = Class.extend(function(IEnumerable){
        service = IEnumerable;
      });
      
      new Child();
    });    
  });
});
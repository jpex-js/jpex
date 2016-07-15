/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Factory (instance - default)', function(){
    
      it('should register a factory function', function(){
        var fn = function(){};
        First.Register.Factory('test', fn);
        expect(First._factories.test.fn).toBe(fn);
      });
      
      it('should register a factory by calling register', function(){
        var fn = function(){};
        First.Register('test', fn);
        expect(First._factories.test.fn).toBe(fn);
      });
      
      it('should run the factory for every dependency request', function(){
        var fn = function(){
          return {};
        };
        First.Register.Factory('test', fn);
        
        var lastObj;
        
        var Second = First.extend({
          constructor : function(obj){
            expect(obj).toBeDefined();
            expect(obj).not.toBe(lastObj);
            lastObj = obj;
          },
          dependencies : 'test'
        });
        
        new Second();
        new Second();
        new Second();
        expect(lastObj).toBeDefined();
      });
      
      it('should accept dependencies', function(){
        First.Register.Factory('a', function(){
          return 'A';
        });
        First.Register.Factory('b', 'a', function(a){
          return a + 'B';
        });
        
        var Second = First.extend({
          constructor : function(a, b){
            expect(a).toBe('A');
            expect(b).toBe('AB');
          },
          dependencies : ['a', 'b']
        });
        
        new Second();
      });
      
      it('should skip if no function is provided', function(){
        First.Register.Factory('test');
        expect(First._factories.test).toBeUndefined();
      });
    });
    describe('Factory (singleton)', function(){
      it('should wrap the function in a singleton method', function(){
        var fn = function(){};
        First.Register.Factory('test', fn, true);
        expect(First._factories.test).toBeDefined();
        expect(First._factories.test.fn).not.toBe(fn);
      });
      it('should only create one instance of the factory function', function(){
        var fn = function(){
          return {};
        };
        First.Register.Factory('test', fn, true);
        
        var lastObj;
        
        var Second = First.extend({
          constructor : function(obj){
            expect(obj).toBeDefined();
            if (lastObj){
              expect(obj).toBe(lastObj);
            }
            lastObj = obj;
          },
          dependencies : 'test'
        });
        
        new Second();
        new Second();
        new Second();
        expect(lastObj).toBeDefined();
      });
    });
    
    describe('Constant', function(){
      it('should return a constant value', function(){
        var obj = {};
        First.Register.Constant('object', obj);
        
        expect(First._factories.object).toBeDefined();
        expect(First._factories.object.fn()).toBe(obj);
        
        var Second = First.extend({
          constructor : function(obj2){
            expect(obj2).toBe(obj);
          },
          dependencies : 'object'
        });
        
        new Second();
      });
    });
    
    describe('Service (instance - default)', function(){
      it('should register a service', function(){
        First.Register.Service('test', function(){});
        expect(First._factories.test).toBeDefined();
      });
      it('should wrap the function in a factory function', function(){
        var fn = function(){};
        First.Register.Service('test', fn);
        expect(First._factories.test.fn).not.toBe(fn);
      });
      it('should create a new instance of the service when injected', function(){
        var fn = function(){
          this.val = 'hello!';
        };
        First.Register.Service('test', fn);
        
        var Second = First.extend({
          dependencies : 'test',
          constructor : function(test){
            expect(test.val).toBe('hello!');
          }
        });
        
        new Second();
      });
      it('should create a new instance every time', function(){
        var fn = function(){};
        First.Register.Service('test', fn);
        
        var lastObj;
        
        var Second = First.extend({
          dependencies : 'test',
          constructor : function(obj){
            expect(obj).toBeDefined();
            expect(obj).not.toBe(lastObj);
            lastObj = obj;
          }
        });
        
        new Second();
        new Second();
        new Second();
        
        expect(lastObj).toBeDefined();
      });
      it('should inject dependencies into the service', function(){
        var factory = function(){
          return 'A';
        };
        var service = function(a){
          this.val = a;
        };
        First.Register.Factory('a', factory);
        First.Register.Service('b', 'a', service);
        
        var Second = First.extend({
          dependencies : ['a', 'b'],
          constructor : function(a, b){
            expect(a).toBe('A');
            expect(b.val).toBe('A');
          }
        });
        
        new Second();
      });
      
      it('should skip if no function is provided', function(){
        First.Register.Service('test', ['dependency']);
        expect(First._factories.test).toBeUndefined();
      });
    });
    
    describe('Service (singleton)', function(){
      it('should only create a single instance', function(){
        var fn = function(){};
        First.Register.Service('test', fn, true);
        
        var lastObj;
        
        var Second = First.extend({
          dependencies : 'test',
          constructor : function(obj){
            expect(obj).toBeDefined();
            if (lastObj){
              expect(obj).toBe(lastObj);
            }
            lastObj = obj;
          }
        });
        
        new Second();
        new Second();
        new Second();
        
        expect(lastObj).toBeDefined();
      });
    });
    
    describe('File', function(){
      it('should register a file as a dependency', function(){
        First.Register.File('fileDependency', '../spec/folder/file');
        expect(Object.keys(First._factories).length).toBe(1);
        expect(First._factories.fileDependency).toBeDefined();
      });
      it('should attempt to load the dependency from the registered javascript file', function(done){
        var Second = First.extend(function(fileDependency){
          expect(fileDependency).toBeDefined();
          expect(fileDependency.val).toBe('loaded from file');
          done();
        });
        Second.Register.File('fileDependency', '../spec/folder/file');
        new Second();
      });
      it('should attempt to load the dependency from the registered json file', function(done){
        var Second = First.extend(function(jsonFileDependency){
          expect(jsonFileDependency).toBeDefined();
          expect(jsonFileDependency.val).toBe('loaded from json');
          done();
        });
        Second.Register.File('jsonFileDependency', '../spec/folder/json');
        new Second();
      });
      it('should check parent and ancestor files', function(done){
        First.Register.File('file', '../spec/folder/file');
        var Second = First.extend();
        var Third = Second.extend(function(file){
          expect(file).toBeDefined();
          expect(file.val).toBe('loaded from file');
          done();
        });
        
        new Third();
      });
    });
    
    describe('Folder', function(){
      it('should register a folder', function(){
        First.Register.Folder('../spec/folder');
        First.Register.Folder('../spec/folder2');
        expect(First._folders.length).toBe(2);
      });
      it('should not add duplicate folders', function(){
        First.Register.Folder('../spec/folder');
        expect(First._folders.length).toBe(1);
        First.Register.Folder('../spec/folder');
        expect(First._folders.length).toBe(1);
        First.Register.Folder('../spec/folder2');
        expect(First._folders.length).toBe(2);
      });
      it('should attempt to load a dependency from a registered folder', function(done){
        var Second = First.extend(function(file){
          expect(file).toBeDefined();
          expect(file.val).toBe('loaded from file');
          done();
        });
        Second.Register.Folder('../spec/folder');
        
        new Second();
      });
      it('should check all folders until the dependency is found', function(done){
        var Second = First.extend(function(json){
          expect(json).toBeDefined();
          expect(json.val).toBe('loaded from json');
          done();
        });
        Second.Register.Folder('../spec/a');
        Second.Register.Folder('../spec/b');
        Second.Register.Folder('../spec/folder');
        
        new Second();
      });
      it('should check parent and ancestor folders', function(done){
        First.Register.Folder('../spec/folder');
        var Second = First.extend();
        var Third = Second.extend(function(file){
          expect(file).toBeDefined();
          expect(file.val).toBe('loaded from file');
          done();
        });
        
        new Third();
      });
      it('should cache the located file', function(done){
        var Second = First.extend(function(file){
          expect(file).toBeDefined();
          expect(file.val).toBe('loaded from file');
          expect(Second._factories.file).toBeDefined();
          done();
        });
        Second.Register.Folder('../spec/folder');
        
        expect(Second._factories.file).toBeUndefined();
        new Second();
      });
    });
    
    describe('NodeModule', function(){
      it('should register a node module', function(){
        First.Register.NodeModule('istanbul');
        expect(First._factories.istanbul).toBeDefined();
      });
      it('should load a node module as a dependency', function(done){
        First.Register.NodeModule('istanbul');
        var Second = First.extend(function(istanbul){
          expect(istanbul).toBeDefined();
          done();
        });
        
        new Second();
      });
    });
    
    describe('Node Modules', function(){
      it('should try to require the dependency from node_modules', function(done){
        var Second = First.extend(function(istanbul){
          expect(istanbul).toBeDefined();
          done();
        });
        
        new Second();
      });
      it('should cache the node module', function(done){
        var Second = First.extend(function(istanbul){
          expect(istanbul).toBeDefined();
          expect(Second._factories.istanbul).toBeDefined();
          done();
        });
        
        expect(Second._factories.istanbul).toBeUndefined();
        new Second();
      });
    });
    
    describe('Enums', function(){
      it('should register enumerations', function(){
        First.Register.Enum('values', ['Apple', 'Banana']);
        expect(First._factories.values).toBeDefined();
      });
      it('should inject enumerations', function(done){
        First.Register.Enum('values', ['Apple', 'Banana']);
        var Second = First.extend(function(values){
          expect(values).toBeDefined();
          expect(values.Apple).toBeDefined();
          expect(values.Banana).toBeDefined();
          expect(values.Apple).toBe(0);
          expect(values.Banana).toBe(1);
          done();
        });
        
        new Second();
      });
      it('should accept a single enum', function(done){
        First.Register.Enum('values', 'Apple');
        var Second = First.extend(function(values){
          expect(values).toBeDefined();
          expect(values.Apple).toBeDefined();
          expect(values.Apple).toBe(0);
          expect(Object.keys(values).length).toBe(1);
          done();
        });
        
        new Second();
      });
      it('should accept an array of enums', function(done){
        First.Register.Enum('values', ['Apple', 'Banana']);
        var Second = First.extend(function(values){
          expect(values).toBeDefined();
          expect(values.Apple).toBeDefined();
          expect(values.Banana).toBeDefined();
          expect(values.Apple).toBe(0);
          expect(values.Banana).toBe(1);
          done();
        });
        
        new Second();
      });
      it('should accept an object of enums', function(done){
        First.Register.Enum('values', {Apple : 2, Banana : 4});
        var Second = First.extend(function(values){
          expect(values).toBeDefined();
          expect(values.Apple).toBeDefined();
          expect(values.Banana).toBeDefined();
          expect(values.Apple).toBe(2);
          expect(values.Banana).toBe(4);
          done();
        });
        
        new Second();
      });
      it('should accept a mix of array elements and objects', function(done){
        First.Register.Enum('values', ['Apple', {Banana : 4, Carrot : 8}, 'Date']);
        var Second = First.extend(function(values){
          expect(values).toBeDefined();
          expect(Object.keys(values).length).toBe(4);
          done();
        });
        
        new Second();
      });
      it('should increment the id based on the value of objects', function(done){
        First.Register.Enum('values', ['Apple', {Banana : 4, Carrot : 8}, 'Date']);
        var Second = First.extend(function(values){
          expect(values).toBeDefined();
          expect(values.Apple).toBe(0);
          expect(values.Banana).toBe(4);
          expect(values.Carrot).toBe(8);
          expect(values.Date).toBe(9);
          done();
        });
        
        new Second();
      });
      it('should stop an enum from being overwritten', function(done){
        First.Register.Enum('values', ['Apple', {Banana : 4, Carrot : 8}, 'Date']);
        var Second = First.extend(function(values){
          expect(values).toBeDefined();
          expect(values.Apple).toBe(0);
          expect(values.Banana).toBe(4);
          
          values.Apple = 13;
          values.Banana = 15;
          
          expect(values.Apple).toBe(0);
          expect(values.Banana).toBe(4);
          done();
        });
        
        new Second();
      });
    });
  });
  
  describe('Resolve dependencies', function(){
    it('should resolve dependencies with services and factories', function(){
      First.Register.Factory('factory', () => 'FACTORY');
      First.Register.Service('service', function(){this.val = 'SERVICE';});
      First.Register.Service('dependent', function(){this.val = 'DEPENDENT';});
      First.Register.Service('master', 'dependent', function(d){this.val = 'MASTER'; this.sub = d.val;});
      First.Register.Constant('constant', 'CONSTANT');
      
      var Second = First.extend({
        dependencies : ['factory', 'service', 'master', 'constant'],
        constructor : function(f, s, m, c){
          expect(f).toBe('FACTORY');
          expect(s.val).toBe('SERVICE');
          expect(m.val).toBe('MASTER');
          expect(m.sub).toBe('DEPENDENT');
          expect(c).toBe('CONSTANT');
        }
      });
      
      new Second();
    });
    it('should resolve using named parameters', function(){
      var Second = First.extend({
        dependencies : 'named',
        constructor : function(n){
          expect(n).toBe('i am named');
        }
      });
      
      new Second({named : 'i am named'});
    });
    it('should resolve object dependencies', function(){
      var hasRun = false;
    
      First.Register.Factory('a', '$options', function($options){
        expect($options).toBe('abcdef');
        hasRun = true;
      });
      First.Register.Factory('b', {a : 'abcdef'}, function(){});
      
      var Second = First.extend({
        dependencies : 'b',
        constructor : function(){}
      });
      
      new Second();
      
      expect(hasRun).toBe(true);
    });
    it('should error if dependency doesn\'t exist', function(){
      var Second = First.extend({
        dependencies : 'false'
      });
      
      var err;
      
      new Second({false : 'false'});
      
      try{
        new Second();
      }
      catch(e){
        err = e;
      }
      finally{
        expect(err).toBeDefined();
      }
    });
  });
  
  describe('Inheritance', function(){
    it('should use factories of ancestor classes', function(){
      First.Register.Factory('a', function(){
        return 'A';
      });
      var Second = First.extend();
      var Third = Second.extend();
      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('A');
        }
      });
      
      new Fourth();
    });
    it('should overwrite ancestor classes', function(){
      First.Register.Factory('a', () => 'A');
      var Second = First.extend();
      var Third = Second.extend();
      Third.Register.Factory('a', () => 'B');
      
      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('B');
        }
      });
      
      new Fourth();
    });
    it('should use named parameters over registered dependencies', function(){
      First.Register.Factory('a', () => 'A');
      var Second = First.extend();
      var Third = Second.extend();
      Third.Register.Factory('a', () => 'B');
      
      var Fourth = Third.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('C');
        }
      });
      
      new Fourth({a : 'C'});
    });
    it('should not use factories of a child class', function(){
      First.Register.Factory('a', () => 'A');
      var Second = First.extend({
        dependencies : 'a',
        constructor : function(a){
          expect(a).toBe('A');
        }
      });
      var Third = Second.extend();
      Third.Register.Factory('a', () => 'B');
      
      new Second();
    });
  });
  
  describe('Inferred Dependencies', function(){
    it('should calculate dependencies based on the constructor function', function(){
      var A = First.extend(function(a, b, c){
        expect(a).toBe('A');
        expect(b).toBe('B');
        expect(c).toBe('C');
      });
      A.Register.Constant('a', 'A');
      A.Register.Constant('b', 'B');
      
      expect(A.Dependencies).toBeDefined();
      expect(A.Dependencies.length).toBe(3);
      expect(A.Dependencies[0]).toBe('a');
      expect(A.Dependencies[1]).toBe('b');
      expect(A.Dependencies[2]).toBe('c');
    });
    it('should also work for arrow functions', function(){
      var A = First.extend((a, b, c) => {
        expect(a).toBe('A');
        expect(b).toBe('B');
        expect(c).toBe('C');
      });
      A.Register.Constant('a', 'A');
      A.Register.Constant('b', 'B');
      
      expect(A.Dependencies).toBeDefined();
      expect(A.Dependencies.length).toBe(3);
      expect(A.Dependencies[0]).toBe('a');
      expect(A.Dependencies[1]).toBe('b');
      expect(A.Dependencies[2]).toBe('c');
    });
    it('should also work for single-parameter arrow functions', function(){
      var A = First.extend(a => {
        expect(a).toBe('A');
      });
      
      expect(A.Dependencies).toBeDefined();
      expect(A.Dependencies.length).toBe(1);
      expect(A.Dependencies[0]).toBe('a');
    });
    it('should infer dependencies for factories', function(){
      var A = First.extend(function(service){
        expect(service.val.val).toBe('A');
      });
      A.Register.Constant('a', 'A');
      A.Register.Factory('factory', function(a){
        return {
          val : a
        };
      });
      A.Register.Service('service', function(factory){
        this.val = factory;
      });
      
      new A();
    });
  });
  
  describe('Recursion', function(){
    it('should error if a dependency is recurring', function(){
      First.Register.Factory('a', function(a){});
      var A = First.extend(function(a){});
      
      var err;
      try{
        new A();
      }
      catch(e){
        err = e;
      }
      finally{
        expect(err).toBeDefined();
        expect(err.message).toBe('Recursive loop for dependency a encountered');
      }
    });
  });
  
  describe('Bind to Instance', function(){
    it('should bind dependencies to the instance', function(){
      First.Register.Factory('myFactory', function(){
        return {};
      });
      var Second = First.extend({
        bindToInstance : true,
        constructor : function(myFactory, myService, myNamedParameter, fs){}
      });
      Second.Register.Service('myService', function(){});
      
      var instance = new Second({myNamedParameter : {}});
      
      expect(instance.myFactory).toBeDefined();
      expect(instance.myService).toBeDefined();
      expect(instance.myNamedParameter).toBeDefined();
      expect(instance.fs).toBeDefined();
    });
  });
});
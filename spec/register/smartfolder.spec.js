/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('Smart Folder', function(){
      it('should register a file from a folder', function(done){
        First.Register.Folder('../spec/smart', {pattern : 'constant.*'});
        
        expect(First._factories.constant).toBeDefined();
        
        var Second  = First.extend(function(constant){
          expect(constant).toBeDefined();
          expect(constant.test).toBe('i am a constant');
          done();
        });
        
        new Second();
      });
      it('should register an index.js file', function(done){
        First.Register.Folder('../spec/smart', {pattern : 'folder/*.*'});
        expect(First._factories.folder).toBeDefined();
        
        var Second  = First.extend(function(folder){
          expect(folder).toBeDefined();
          expect(folder).toBe('i am an index.js file');
          done();
        });
        
        new Second();
      });
      it('should load multiple files from within multiple folders', function(done){
        First.Register.Folder('../spec/smart', {pattern : 'folders/**/*.*'});
        expect(First._factories.foldersFirst).toBeDefined();
        expect(First._factories.foldersSecond).toBeDefined();
        expect(First._factories.foldersSubFirst).toBeDefined();
        expect(First._factories.foldersSubSecond).toBeDefined();
        
        var Second = First.extend(function(foldersFirst, foldersSecond, foldersSubFirst, foldersSubSecond){
          expect(foldersFirst).toBe('first');
          expect(foldersSecond).toBe('second');
          expect(foldersSubFirst).toBe('sub first');
          expect(foldersSubSecond).toBe('sub second');
          done();
        });
        
        new Second();
      });
      it('should accept a custom name transformer', function(){
        var expected = ['index', 'first', 'second', 'first', 'second', 'constant', 'factory', 'service', 'enums'];
        
        First.Register.Folder('../spec/smart', {
          pattern : '**/*.{js,json}',
          transform : function(file, folders, ext){
            expect(typeof file).toBe('string');
            expect(Array.isArray(folders)).toBe(true);
            expect(ext[0]).toBe('.');
            
            var i = expected.indexOf(file);
            expect(i).toBeGreaterThan(-1);
            expected.splice(i, 1);
          }
        });
        
        expect(expected.length).toBe(0);
      });
      it('should exclude any null transformer results', function(){
        First.Register.Folder('../spec/smart', {
          pattern : '**/*.*',
          transform : function(file){
            if (file === 'first' || file === 'constant'){
              return file;
            }else{
              return false;
            }
          }
        });
        expect(First._factories.first).toBeDefined();
        expect(First._factories.constant).toBeDefined();
        expect(Object.keys(First._factories).length).toBe(2);
      });
      it('should accept a custom register function', function(){
        var opt = {
          pattern : '*.json',
          register : function(){}
        };
        spyOn(opt, 'register');
        First.Register.Folder('../spec/smart', opt);
        expect(opt.register).toHaveBeenCalled();
      });
      
      it('should register a factory', function(done){
        First.Register.Folder('../spec/smart', {type : 'factory', pattern : 'factory.js'});
        
        var Second = First.extend(function(factory){
          expect(factory).toBe('i am a factory');
          done();
        });
        
        new Second();
      });
      it('should not register an invalid factory', function(){
        var err;
        
        try{
          First.Register.Folder('../spec/smart', {type : 'factory', pattern : 'constant.json'});
        }
        catch(e){
          err = e;
        }
        finally{
          expect(err).toBeDefined();
        }
      });
      it('should register a service', function(done){
        First.Register.Folder('../spec/smart', {type : 'service', pattern : 'service.js'});
        
        var Second = First.extend(function(service){
          expect(service.test).toBe('i am a service');
          done();
        });
        
        new Second();
      });
      it('should not register an invalid service', function(){
        var err;
        
        try{
          First.Register.Folder('../spec/smart', {type : 'service', pattern : 'constant.json'});
        }
        catch(e){
          err = e;
        }
        finally{
          expect(err).toBeDefined();
        }
      });
      it('should register a constant', function(done){
        First.Register.Folder('../spec/smart', {type : 'constant', pattern : 'constant.json'});
        
        var Second = First.extend(function(constant){
          expect(constant.test).toBe('i am a constant');
          done();
        });
        
        new Second();
      });
      it('should register an enum', function(done){
        First.Register.Folder('../spec/smart', {type : 'enum', pattern : 'enums.json'});
        
        var Second = First.extend(function(enums){
          expect(enums.test).toBeDefined();
          done();
        });
        
        new Second();
      });
      
      it('should determine how to register a file automatically', function(){
        First.Register.Folder('../spec/smart', {pattern : '{constant,factory}.*'});
        var Second = First.extend(function(constant, factory){
          expect(constant.test).toBe('i am a constant');
          expect(factory).toBe('i am a factory');
        });
      });
      it('should add a prefix and suffix to the dependency', function(){
        First.Register.Folder('../spec/smart', {prefix : 'pre', suffix : 'post'});
        
        expect(First._factories.preFactoryPost).toBeDefined();
        expect(First._factories.preFoldersSubFirstPost).toBeDefined();
      });
      
      it('should not prefix the folder name', function(){
        First.Register.Folder('../spec/smart', {
          prefixFolder : false,
          pattern : '**/first.js'
        });
        
        expect(First._factories.first).toBeDefined();
        expect(Object.keys(First._factories).length).toBe(1);
      });
    });
  });
});
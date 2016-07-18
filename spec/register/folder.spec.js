/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
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
  });
});
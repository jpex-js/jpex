/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
    describe('File', function(){
      it('should register a file as a dependency', function(){
        First.Register.File('fileDependency', '../spec/jpex/folder/file');
        expect(Object.keys(First._factories).length).toBe(1);
        expect(First._factories.fileDependency).toBeDefined();
      });
      it('should attempt to load the dependency from the registered javascript file', function(done){
        var Second = First.extend(function(fileDependency){
          expect(fileDependency).toBeDefined();
          expect(fileDependency.val).toBe('loaded from file');
          done();
        });
        Second.Register.File('fileDependency', '../spec/jpex/folder/file');
        new Second();
      });
      it('should attempt to load the dependency from the registered json file', function(done){
        var Second = First.extend(function(jsonFileDependency){
          expect(jsonFileDependency).toBeDefined();
          expect(jsonFileDependency.val).toBe('loaded from json');
          done();
        });
        Second.Register.File('jsonFileDependency', '../spec/jpex/folder/json');
        new Second();
      });
      it('should check parent and ancestor files', function(done){
        First.Register.File('file', '../spec/jpex/folder/file');
        var Second = First.extend();
        var Third = Second.extend(function(file){
          expect(file).toBeDefined();
          expect(file.val).toBe('loaded from file');
          done();
        });
        
        new Third();
      });
    });
  });
});
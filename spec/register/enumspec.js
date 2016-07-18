/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base, First;
  
  beforeEach(function(){
    Base = grequire('.');
    First = Base.extend();
  });

  describe('Registration', function(){
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
});
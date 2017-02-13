/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Life Cycles', function(){
  var Master, resultM, resultA, resultB, resultC, resultD, ClassA, ClassB, ClassC, ClassD;
  beforeEach(function(){
    resultA = resultB = resultC = resultD = null;
    
    Master = grequire('.').extend(myFactory => resultM = myFactory);
    Master.Register.Constant('myConstant', 'master');
    
    ClassA = Master.extend(myFactory => resultA = myFactory);
    ClassA.Register.Constant('myConstant', 'classA');
    
    ClassB = Master.extend(myFactory => resultB = myFactory);
    ClassB.Register.Constant('myConstant', 'classB');
    
    ClassC = ClassA.extend(myFactory => resultC = myFactory);
    ClassC.Register.Constant('myConstant', 'classC');
    
    ClassD = ClassB.extend(myFactory => resultD = myFactory);
    ClassD.Register.Constant('myConstant', 'classD');
  });
  
  describe('Application', function(){
    beforeEach(function(){
      Master.Register
        .Factory('myFactory', myConstant => ({value : myConstant}))
        .lifecycle.application();
    });
    
    it('should return the same instance for all classes', function(){
      new Master();
      new ClassA();
      new ClassB();
      new ClassC();
      new ClassD();
      
      expect(resultM).toBe(resultA);
      expect(resultA).toBe(resultB);
      expect(resultB).toBe(resultC);
      expect(resultC).toBe(resultD);
      
      expect(resultA.value).toBe('master');
    });
    it('should use the first resolution of myConstant, forever', function(){
      new ClassB();
      new Master();
      new ClassA();
      new ClassC();
      new ClassD();
      
      expect(resultM).toBe(resultA);
      expect(resultA).toBe(resultB);
      expect(resultB).toBe(resultC);
      expect(resultC).toBe(resultD);
      
      expect(resultA.value).toBe('classB');
    });
  });
  
  describe('Class', function(){
    beforeEach(function(){
      Master.Register
        .Factory('myFactory', myConstant => ({value : myConstant}))
        .lifecycle.class();
      Master.Register
        .Factory('mySubFactory', myFactory => myFactory);
    });
    
    it('should return different instances for different classes', function(){
      new Master();
      new ClassA();
      new ClassB();
      new ClassC();
      new ClassD();
      
      expect(resultA).not.toBe(resultB);
      expect(resultB).not.toBe(resultC);
      expect(resultC).not.toBe(resultD);
      
      expect(resultM.value).toBe('master');
      expect(resultA.value).toBe('classA');
      expect(resultB.value).toBe('classB');
      expect(resultC.value).toBe('classC');
      expect(resultD.value).toBe('classD');
    });
    it('should return the same instance for every instance of a class', function(){
      var instanceAs = [], instanceBs = [];
      for (var x = 0; x < 2; x++){
        new ClassA();
        new ClassB();
        instanceAs.push(resultA);
        instanceBs.push(resultB);
      }
      
      expect(instanceAs[0]).toBe(instanceAs[1]);
      expect(instanceBs[0]).toBe(instanceBs[1]);
      
      expect(instanceAs[0]).not.toBe(instanceBs[0]);
    });
    it('should not inherit the same instance', function(){
      var instanceAs = [], instanceCs = [];
      for (var x = 0; x < 2; x++){
        new ClassA();
        new ClassC();
        instanceAs.push(resultA);
        instanceCs.push(resultC);
      }
      
      expect(instanceAs[0]).toBe(instanceAs[1]);
      expect(instanceCs[0]).toBe(instanceCs[1]);
      
      expect(instanceAs[0]).not.toBe(instanceCs[0]);
    });
    it('should use the same value when resolving sub dependencies', function(){
      var resultX;
      ClassA = Master.extend(function(myFactory, mySubFactory){
        resultA = myFactory;
        resultX = mySubFactory;
      });
      new ClassA();
      
      expect(resultA).toBe(resultX);
    });
    it('should use the same value to invoke the parent', function(){
      ClassA = Master.extend({
        invokeParent : true,
        constructor : function(myFactory){
        resultA = myFactory;
      }});
      new ClassA();
      
      expect(resultA).toBe(resultM);
    });
  });
  
  describe('Instance', function(){
    beforeEach(function(){
      Master.Register
        .Factory('myFactory', myConstant => ({value : myConstant}))
        .lifecycle.instance();
      Master.Register
        .Factory('mySubFactory', myFactory => myFactory);
    });
    
    it('should return different instances for different classes', function(){
      new Master();
      new ClassA();
      new ClassB();
      new ClassC();
      new ClassD();
      
      expect(resultA).not.toBe(resultB);
      expect(resultB).not.toBe(resultC);
      expect(resultC).not.toBe(resultD);
      
      expect(resultM.value).toBe('master');
      expect(resultA.value).toBe('classA');
      expect(resultB.value).toBe('classB');
      expect(resultC.value).toBe('classC');
      expect(resultD.value).toBe('classD');
    });
    it('should return the different instances for every instance of a class', function(){
      var instanceAs = [], instanceBs = [];
      for (var x = 0; x < 2; x++){
        new ClassA();
        new ClassB();
        instanceAs.push(resultA);
        instanceBs.push(resultB);
      }
      
      expect(instanceAs[0]).not.toBe(instanceAs[1]);
      expect(instanceBs[0]).not.toBe(instanceBs[1]);
      
      expect(instanceAs[0]).not.toBe(instanceBs[0]);
    });
    it('should not inherit the same instance', function(){
      var instanceAs = [], instanceCs = [];
      for (var x = 0; x < 2; x++){
        new ClassA();
        new ClassC();
        instanceAs.push(resultA);
        instanceCs.push(resultC);
      }
      
      expect(instanceAs[0]).not.toBe(instanceAs[1]);
      expect(instanceCs[0]).not.toBe(instanceCs[1]);
      
      expect(instanceAs[0]).not.toBe(instanceCs[0]);
    });
    it('should use the same value when resolving sub dependencies', function(){
      var resultX;
      ClassA = Master.extend(function(myFactory, mySubFactory){
        resultA = myFactory;
        resultX = mySubFactory;
      });
      new ClassA();
      
      expect(resultA).toBe(resultX);
    });
    it('should use the same value to invoke the parent', function(){
      ClassA = Master.extend({
        invokeParent : true,
        constructor : function(myFactory){
        resultA = myFactory;
      }});
      new ClassA();
      
      expect(resultA).toBe(resultM);
    });
  });
  
  describe('None', function(){
    beforeEach(function(){
      Master.Register
        .Factory('myFactory', myConstant => ({value : myConstant}))
        .lifecycle.none();
      Master.Register
        .Factory('mySubFactory', myFactory => myFactory);
    });
    
    it('should return different instances for different classes', function(){
      new Master();
      new ClassA();
      new ClassB();
      new ClassC();
      new ClassD();
      
      expect(resultA).not.toBe(resultB);
      expect(resultB).not.toBe(resultC);
      expect(resultC).not.toBe(resultD);
      
      expect(resultM.value).toBe('master');
      expect(resultA.value).toBe('classA');
      expect(resultB.value).toBe('classB');
      expect(resultC.value).toBe('classC');
      expect(resultD.value).toBe('classD');
    });
    it('should return different instances for every instance of a class', function(){
      var instanceAs = [], instanceBs = [];
      for (var x = 0; x < 2; x++){
        new ClassA();
        new ClassB();
        instanceAs.push(resultA);
        instanceBs.push(resultB);
      }
      
      expect(instanceAs[0]).not.toBe(instanceAs[1]);
      expect(instanceBs[0]).not.toBe(instanceBs[1]);
      
      expect(instanceAs[0]).not.toBe(instanceBs[0]);
    });
    it('should not inherit the same instance', function(){
      var instanceAs = [], instanceCs = [];
      for (var x = 0; x < 2; x++){
        new ClassA();
        new ClassC();
        instanceAs.push(resultA);
        instanceCs.push(resultC);
      }
      
      expect(instanceAs[0]).not.toBe(instanceAs[1]);
      expect(instanceCs[0]).not.toBe(instanceCs[1]);
      
      expect(instanceAs[0]).not.toBe(instanceCs[0]);
    });
    it('should not use the same value when resolving sub dependencies', function(){
      var resultX;
      ClassA = Master.extend(function(myFactory, mySubFactory){
        resultA = myFactory;
        resultX = mySubFactory;
      });
      new ClassA();
      
      expect(resultA).not.toBe(resultX);
    });
  });
});
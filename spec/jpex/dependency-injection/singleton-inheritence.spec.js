/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Singleton Inheritence', function(){
  var Jpex;
  beforeEach(function(){
    Jpex = grequire('.');
  });
  
  describe('Overwriting parent dependencies', function(){
    var Master, ClassA, ClassB, resultA, resultB;
    beforeEach(function(){
      Master = Jpex.extend();
      Master.Register.Interface('iMasterFactory', i => i.any());
      Master.Register.Interface('iSlaveFactory', i => i.any());

      Master.Register.Factory('masterFactory', (iSlaveFactory) => iSlaveFactory, true)
        .interface('iMasterFactory');
      Master.Register.Factory('slaveFactory', () => 'slave factory')
        .interface('iSlaveFactory');
      
      ClassA = Master.extend(function(iMasterFactory){
        resultA = iMasterFactory;
      });
      ClassB = Master.extend(function(iMasterFactory){
        resultB = iMasterFactory;
      });
      
      ClassA.Register.Factory('classASlave', function(){
        return 'classA slave';
      }).interface('iSlaveFactory');
    });
    
    it('should use ClassA\'s definition of iSlaveFactory', function(){
      new ClassA();
      expect(resultA).toBe('classA slave');
    });
    it('should use ClassB\'s definition of iSlaveFactory', function(){
      new ClassB();
      expect(resultB).toBe('slave factory');
    });
    it('should use its own definition of iSlaveFactory', function(){
      new ClassA();
      new ClassB();
      
      expect(resultA).toBe('classA slave');
      expect(resultB).toBe('slave factory');
    });
  });
});
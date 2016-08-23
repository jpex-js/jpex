/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Base Class - Dependency Injection', function(){
  var Base;
  
  beforeEach(function(){
    Base = grequire('.');
  });

  describe('Registration', function(){
    describe('Jpex As A Service', function(){
      it('should register a class as a service', function(){
        var Service = Base.extend();
        var Class = Base.extend();
        Class.Register.Service('service', Service);
        expect(Class._factories.service).toBeDefined();
      });
      it('should inject an instance of a jpex class', function(){
        var a, b;
        
        var Service = Base.extend(function(){
          this.do = function(){
            a = 'Service!';
          };
        });
        var Class = Base.extend(function(service){
          this.do = function(){
            b = 'Class!';
            service.do();
          };
        });
        Class.Register.Service('service', Service);
        
        var instance = new Class();
        instance.do();
        expect(a).toBe('Service!');
        expect(b).toBe('Class!');
      });
      it('should inject dependencies into the jpex class', function(){
        var factory, service, classx;
        
        var Factory = function(){
          return {
            do : function(){
              factory = 'factory';
            }
          };
        };
        
        var Service = Base.extend({
          dependencies : 'factory',
          bindToInstance : true,
          prototype : {
            do : function(){
              this.factory.do();
              service = 'service';
            }
          }
        });
        Service.Register.Factory('factory', Factory);
        
        var Class = Base.extend(function(service){
          this.do = function(){
            service.do();
            classx = 'class';
          };
        });
        Class.Register.Service('service', Service);
        
        var instance = new Class();
        instance.do();
        expect(classx).toBe('class');
        expect(service).toBe('service');
        expect(factory).toBe('factory');
      });
      it('should inject dependencies declared on the factory', function(){
        var factory, service, classx;
        
        var Factory = function(){
          return {
            do : function(){
              factory = 'factory';
            }
          };
        };
        
        var Service = Base.extend({
          dependencies : 'factory',
          bindToInstance : true,
          prototype : {
            do : function(){
              this.factory.do();
              service = 'service';
            }
          }
        });
        
        var Class = Base.extend(function(service){
          this.do = function(){
            service.do();
            classx = 'class';
          };
        });
        Class.Register.Service('service', ['factory'], Service);
        Class.Register.Factory('factory', Factory);
        
        var instance = new Class();
        instance.do();
        expect(classx).toBe('class');
        expect(service).toBe('service');
        expect(factory).toBe('factory');
      });
      it('should inject object dependencies declared on the factory', function(){
        var factory, service, classx;
        
        var Factory = function($options){
          expect($options).toBe('option');
          return {
            do : function(){
              factory = 'factory';
            }
          };
        };
        
        var Service = Base.extend({
          dependencies : 'factory',
          bindToInstance : true,
          prototype : {
            do : function(){
              this.factory.do();
              service = 'service';
            }
          }
        });
        
        var Class = Base.extend(function(service){
          this.do = function(){
            service.do();
            classx = 'class';
          };
        });
        Class.Register.Service('service', {'factory' : 'option'}, Service);
        Class.Register.Factory('factory', Factory);
        
        var instance = new Class();
        instance.do();
        expect(classx).toBe('class');
        expect(service).toBe('service');
        expect(factory).toBe('factory');
      });
      it('should inject namedParameters from the instantiating class', function(){
        var factory, service, classx;
        
        var Factory = {
          do : function(){
            factory = 'factory';
          }
        };
        
        var Service = Base.extend(function(factory){
          this.do = function(){
            factory.do();
            service = 'service';
          };
        });
        
        var Class = Base.extend(function(service){
          this.do = function(){
            service.do();
            classx = 'class';
          };
        });
        Class.Register.Service('service', Service);
        
        var instance = new Class({factory : Factory});
        
        instance.do();
        expect(classx).toBe('class');
        expect(service).toBe('service');
        expect(factory).toBe('factory');
      });
      it('should inject a combination of dependencies from all sources', function(){
        var classx, service, external, internal, named, user;
        
        var NamedParameters = {
          namedParameter : {
            do : function(){
              named = 'named';
            }
          }
        };
        var InternalFactory = function(){
          return {
            do : function(){
              internal = 'internal';
            }
          };
        };
        var ExternalFactory = function(){
          this.do = function(){
            external  = 'external';
          };
        };
        
        var FactoryUsingService = function(service){
          user = 'user';
        };
        
        var Service = Base.extend(function(namedParameter, internalFactory, externalFactory){
          service = 'service';
          namedParameter.do();
          internalFactory.do();
          externalFactory.do();
        });
        Service.Register.Factory('internalFactory', InternalFactory);
        
        var Class = Base.extend(function(factoryUsingService){
          classx = 'class';
        });
        Class.Register.Service('service', ['externalFactory'], Service);
        Class.Register.Factory('factoryUsingService', FactoryUsingService);
        Class.Register.Service('externalFactory', ExternalFactory);
        
        var instance = new Class(NamedParameters);
        
        expect(classx).toBe('class');
        expect(service).toBe('service');
        expect(external).toBe('external');
        expect(internal).toBe('internal');
        expect(named).toBe('named');
        expect(user).toBe('user');
      });
    });
  });
});
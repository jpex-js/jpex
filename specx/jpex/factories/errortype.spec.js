/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
var grequire = require('../../../jpex/grequire');

describe('Jpex - Dependency Injection Register Error Type', function(){
  var Base, Parent, parentError;
  
  beforeEach(function(){
    parentError = null;
    
    Base = grequire('.');
    
    Parent = Base.extend(function($error){
      parentError = $error.ParentError.create('parent error');
    });
    Parent.Register.ErrorType('ParentError');
  });
  
  
  it('should add an _errorTypes constant', function(){
    expect(Parent._factories._errorTypes).toBeDefined();
    expect(Array.isArray(Parent._factories._errorTypes.value)).toBe(true);
  });
  it('should create a $errorFactory factory', function(){
    expect(Parent._factories.$errorFactory).toBeDefined();
  });
  it('should create a $error factory', function(){
    expect(Parent._factories.$error).toBeDefined();
  });
  it('should inject $error with all error types attached', function(){
    new Parent();
    expect(parentError).toBeDefined();
    expect(parentError.name).toBe('ParentError');
  });
  it('should be a singleton', function(){
    var $errArr = [];
    var Class = Parent.extend(function($error){
      $errArr.push($error);
    });
    
    new Class();
    new Class();
    new Class();
    
    expect($errArr.length).toBe(3);
    for (var x = 0; x < 1; x++){
      for (var y = x; y < 1; y++){
        expect($errArr[x]).toBe($errArr[y]);
      }
    }
  });
  it('should inherit error types from a parent', function(){
    var $error;
    var Child = Parent.extend(function(_$error_){
      $error = _$error_;
    });
    new Child();
    
    expect($error.ParentError).toBeDefined();
  });
  it('should not pass the same $error instance to children', function(){
    var $ParentError, $ChildError;
    Parent = Base.extend(function(_$error_){
      $ParentError = _$error_;
    });
    Parent.Register.ErrorType('ParentError');
    
    var Child = Parent.extend(function($error){
      $ChildError = $error;
    });
    
    new Parent();
    new Child();
    expect($ParentError).toBe($ChildError);
  });
  it('should not pass new error types up the inheritence chain', function(){
    var $ParentError, $ChildError;
    Parent = Base.extend(function(_$error_){
      $ParentError = _$error_;
    });
    Parent.Register.ErrorType('ParentError');
    
    var Child = Parent.extend(function($error){
      $ChildError = $error;
    });
    Child.Register.ErrorType('ChildError');
    
    new Parent();
    new Child();
    expect($ParentError).not.toBe($ChildError);
  });
  it('should pass error types from a parent, to an intermediary, to a child', function(){
    var Middle = Parent.extend(function($error){
      expect($error.ParentError).toBeDefined();
    });
    var Child = Middle.extend(function($error){
      expect($error.ParentError).toBeDefined();
      expect($error.ChildError).toBeDefined();
    });
    Child.Register.ErrorType('ChildError');
  });
});
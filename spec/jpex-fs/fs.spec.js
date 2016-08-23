/* globals describe, expect, it, beforeEach, afterEach ,spyOn*/
describe('JPEX - $fs', function(){
  var grequire;
  var Jpex, Base, $fs;
  beforeEach(function(){
    grequire = require('../../jpex/grequire');
    Jpex = grequire('node_modules/jpex');
    grequire('.')();
    
    Base = Jpex.extend(function(_$fs_){
      $fs = _$fs_;
    });
    new Base();
  });
  
  it('should inject $fs', function(){
    expect($fs).toBeDefined();
  });
  
  it('should have callbackable functions from fs', function(){
    expect($fs.write).toBeDefined();
    expect(typeof $fs.stat).toBe('function');
  });
  
  it('should work as a promise', function(done){
    $fs.readdir('./')
      .then(function(arr){
        expect(arr.length).toBeGreaterThan(0);
        expect(arr.indexOf('index.js')).toBeGreaterThan(-1);
        done();
      });
  });
  
  it('should catch errors', function(done){
    $fs.readdir('./doesnot/exist')
      .catch(function(err){
        expect(err).toBeDefined();
        done();
      });
  });
  
  it('should have non-callback method', function(){
    expect($fs.watch).toBeDefined();
  });
});
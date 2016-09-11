module.exports = function(Class){
  Class.Register.Interface('$require', () => {});
  
  Class.Register.Factory('$require', 'path', function(Path){
    return function(path){
      var result = Path.resolve('./' + path);
      return require(result);
    };
  }, true);
};
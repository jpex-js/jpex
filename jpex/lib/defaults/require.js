var grequire = require('../../grequire');

module.exports = function(Class){
  Class.Register.Factory('$require', 'path', function(Path){
    return grequire;
  })
  .lifecycle.application();
};

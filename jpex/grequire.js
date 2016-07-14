var Path = require('path');

module.exports = function(path){
  var result = Path.resolve('./' + path);
  return require(result);
};
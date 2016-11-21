var Path = require('path');

module.exports = function(path){
  var prefix = Path.isAbsolute(path) ? '' : './';
  var fullPath = Path.resolve(prefix + path);
  return require(fullPath);
};

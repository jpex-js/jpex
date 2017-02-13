var Path = require('path');
var isNode = require('./isNode');

module.exports = function(path){
  if (!isNode){
    throw new Error();
  }
  var prefix = Path.isAbsolute(path) ? '' : './';
  var fullPath = Path.resolve(prefix + path);
  return eval('require(fullPath)');
};

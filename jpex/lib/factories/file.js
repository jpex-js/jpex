var grequire = require('../../grequire');

// Load a file from a specified path
module.exports = function(name, path, interface){
  return this.Register.Factory(name, null, () => grequire(path), interface, true);
};
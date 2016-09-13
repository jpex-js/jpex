module.exports = function(name, interface){
  return this.Register.Factory(name, null, () => require(name), interface, true);
};
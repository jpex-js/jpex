module.exports = function(name){
  return this.Register.Factory(name, null, () => require(name)).lifecycle.application();
};

module.exports = {
  defaults : ['./log', './timeout', './promise', './error'],
  apply : function(Class){
    this.defaults.forEach(n => {
      require(n)(Class);
    });
  }
};
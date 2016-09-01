module.exports = {
  defaults : [
    require('./log'), 
    require('./timeout'), 
    require('./promise'), 
    require('./error')
  ],
  apply : function(Class){
    this.defaults.forEach(n => {
      n(Class);
    });
  }
};
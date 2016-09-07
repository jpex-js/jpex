module.exports = {
  defaults : [
    require('./log'), 
    require('./timeout'), 
    require('./promise'), 
    require('./fs'),
    require('./error'),
    require('./errorFactory')
  ],
  apply : function(Class){
    this.defaults.forEach(n => {
      n(Class);
    });
  }
};
module.exports = function(context, args){
  return new (Function.prototype.bind.apply(context, args));
};
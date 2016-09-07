module.exports = function(path, opt){
  if (typeof opt === 'object' && this.Register.SmartFolder){
    return this.Register.SmartFolder(path, opt);
  }
  
  if (this._folders.indexOf(path) === -1 ){
    this._folders.push(path);
  }
  
  return this;
};
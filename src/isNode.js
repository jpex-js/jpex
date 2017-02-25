var _process;

try{
  _process = eval('process');
}catch(e){
  // No process variable
}

module.exports = typeof _process === 'object' && _process.toString() === '[object process]';

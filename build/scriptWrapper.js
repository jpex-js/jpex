(function(){
  var __jpex_modules__ = [];
  <scripts>
  var __jpex_require__ = function(target){
    if (__jpex_require__.cache[target]){
      return __jpex_require__.cache[target];
    }
    var module = { exports : {} };
    var fn = __jpex_modules__[target];
    if (!fn){
      throw new Error('Could not find module ' + target);
    }
    fn(__jpex_require__, module, module.exports);
    __jpex_require__.cache[target] = module.exports;

    return module.exports;
  };
  __jpex_require__.cache = [];

  if (typeof module !== 'undefined'){
    module.exports = __jpex_require__(0);
  }else if (typeof window !== 'undefined'){
    window['<name>'] = __jpex_require__(0);
  }
}());

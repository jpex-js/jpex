module.exports = function(Class){
  Class.Register.Factory('$fs', ['fs', '$promise'], function(fs, $promise){
    
    var $fs = {};
    
    // Promisify async functions (don't return sync functions)
    [
      'access', 'appendFile', 'chmod', 'chown', 'close', 'exists', 
      'fchmod', 'fchown', 'fdatasync', 'fstat', 'fsync', 'ftruncate', 'futimes',
      'lchmod', 'lchown', 'link', 'lstat',
      'mkdir', 'mkdtmp',
      'open', 'read', 'readdir', 'readFile', 'readlink', 'realpath', 'rename', 'rmdir',
      'stat', 'symlink', 'truncate', 'unlink', 'utimes', 'write', 'writeFile'
    ].forEach(function(n){
      $fs[n] = function(){
        var args = Array.from(arguments);
        return $promise(function(rs, rj){
          args.push(function(err, data){
            if (err){
              rj(err);
            }else{
              rs(data);
            }
          });
          fs[n].apply(fs, args);
        });
      };
    });
    
    // Straight copies
    [
      'createReadStream', 'createWriteStream', 'unwatchFile', 'watch', 'watchFile'
    ].forEach(function(n){
      if (typeof fs[n] === 'function'){
        $fs[n] = fs[n].bind(fs);
      }else{
        $fs[n] = fs[n];
      }
    });
    
    
    return $fs;
  }, true);
};
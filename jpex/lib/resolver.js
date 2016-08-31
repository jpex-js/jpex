exports.extractParameters = function(fn){
  var reg_comments = /\/\*(.*)\*\//g,
      chr_open = '(',
      chr_close = ')',
      chr_arrow = '=>',
      chr_delimeter = ',';

  // Remove comments
  var str = fn.toString().replace(reg_comments, '');
  
  // Find the start and end of the function parameters
  var open = str.indexOf(chr_open);
  var close = str.indexOf(chr_close);
  var arrow = str.indexOf(chr_arrow);
  
  // Arrow functions be declared with no brackets
  if (arrow > -1 && (arrow < open || open < 0)){
      str = str.substring(0, arrow).trim();
      return str ? [str] : [];
  }
  
  // Pull out the parameters and split into an array
  str = str.substring(open + 1, close);
  return str ? str.split(chr_delimeter).map((s) => s.trim()) : [];
}

//------------------------------------------------------------

//exports.resolveDependencies = resolveDependencies;
var Jpex = require('./jpex');
var App = Jpex.extend(function($fs, path){
  var base = path.resolve('.') + path.sep;
  $fs.readFile('./jpex/coverage/lcov.info', 'utf8')
    .then(function(data){
      while (data.indexOf(base) > -1){
        data = data.replace(base, '');
      }
      return data.replace(/\\/g, '/');
    })
    .then(function(data){
      return $fs.writeFile('./lcov.info', data, 'utf8');
    });
});

App();

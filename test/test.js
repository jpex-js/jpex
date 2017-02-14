var Jpex = require('../src').extend();

var plugin = {
  install({Jpex, on}){
    Jpex.foo = 'bah';
    on('extend', function ({Class, options}) {
      options.dependencies.forEach(function (dep) {
        if (dep[0] === '$'){
          Class.register.constant(dep, {mocked : true});
        }
      });
    });
    on('extend', function ({Class}) {
      Class.$xxx = true;
    });
    on('factories', function ({register}) {
      register('folder', function (name, target) {
        return this.register.factory(name, ['fs', 'path'], function (fs, path) {
          return fs.readFileSync(path.resolve(__dirname, target), 'utf8');
        })
      });
    });
    on('created', function ({instance}) {
      console.log('on created');
      console.log(instance);
    });
  }
};

Jpex.use(plugin);

var Class = Jpex.extend(function ($window, $log, test) {
  console.log($window, $log);
});
Class.register.folder('test', './test.js');
Class();

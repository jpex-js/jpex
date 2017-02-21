var extractParameters = require('../resolver').extractParameters;
var wrapper = require('./wrapper');

module.exports = function (lifecycle, name, dependencies, fn) {
    if (typeof dependencies === 'function'){
        fn = dependencies;
        dependencies = null;
    }
    if (typeof fn !== 'function'){
        throw new Error('Factory ' + name + ' - fn must be a [Function]');
    }

    if (dependencies){
        dependencies = [].concat(dependencies);
    }else{
        dependencies = extractParameters(fn);
    }
    if (!dependencies.length){
        dependencies = null;
    }

    var f = {
        fn : fn,
        dependencies : dependencies,
        lifecycle : lifecycle
    };
    this.$$factories[name] = f;
    return wrapper(f);
};

// Jpex As A Service
module.exports = function (name, dependencies, Fn) {
    dependencies = dependencies ? [].concat(dependencies) : [];
    dependencies.unshift('$namedParameters');

    function factory() {
        var args = Array.prototype.slice.call(arguments);

        var params = {};

    // Get factory dependencies
        var i = 1;
        dependencies.forEach(function (key) {
            if (typeof key === 'object'){
                Object.keys(key).forEach(function (key2) {
                    var val = args[i++];
                    if (val !== undefined){
                        params[key2] = val;
                    }
                });
            }else{
                var val = args[i++];
                if (val !== undefined){
                    params[key] = val;
                }
            }
        });

    // Get named dependencies
        if (args[0] && typeof args[0] === 'object'){
            Object.keys(args[0]).forEach(function (key) {
                var val = args[0][key];
                if (val !== undefined){
                    params[key] = val;
                }
            });
        }

        return new Fn(params);
    }

    var service = this.register.factory(name, dependencies, factory);

    return service;
};

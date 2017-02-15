var constants = require('../constants');

module.exports = function (factory) {
    var wrapper = {
        lifecycle : {
            application : function () {
                factory.lifecycle = constants.APPLICATION;
                return wrapper;
            },
            class : function () {
                factory.lifecycle = constants.CLASS;
                return wrapper;
            },
            instance : function () {
                factory.lifecycle = constants.INSTANCE;
                return wrapper;
            },
            none : function () {
                factory.lifecycle = constants.NONE;
                return wrapper;
            }
        }
    };

  // WRAPPER HOOKS

    return wrapper;
};

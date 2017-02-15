module.exports = function (name) {
    return this.register.factory(name, [], function () {
        return eval('require(name)');
    }).lifecycle.application();
};

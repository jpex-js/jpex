module.exports = function (name) { // eslint-disable-line
  return eval('require.main.require(name)');
};

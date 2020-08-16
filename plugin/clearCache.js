const { types: t } = require('@babel/core');
const { getPath } = require('./utils');
const {
  getConcreteTypeName,
} = require('./common');

const clearCache = (programPath, path, { identifier, filename, publicPath }) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  const isJpexCall = (
    t.isMemberExpression(callee) &&
    identifier.includes(callee.object.name) &&
    callee.property.name === 'clearCache'
  );

  if (!isJpexCall) {
    return;
  }
  if (args.length === 0) {
    const type = getPath([ 'node', 'typeParameters', 'params', '0' ], path);
    const name = getConcreteTypeName(type, filename, publicPath, programPath);
    if (name != null) {
      args.unshift(t.stringLiteral(name));
    }
  }
};

module.exports = clearCache;

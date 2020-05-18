const { types: t } = require('@babel/core');
const { getPath } = require('./utils');
const { getConcreteTypeName } = require('./common');

const raw = (programPath, path, jpex, filename) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  const isJpexCall = (
    t.isMemberExpression(callee) &&
    jpex.includes(callee.object.name) &&
    callee.property.name === 'raw'
  );

  if (!isJpexCall) {
    return;
  }

  if (args.length) {
    return;
  }

  const type = getPath([ 'node', 'typeParameters', 'params', '0' ], path);
  const name = getConcreteTypeName(type, filename, programPath);
  if (name != null) {
    args.unshift(t.stringLiteral(name));
  } else if (t.isTSTypeLiteral(type) || t.isTSFunctionType(type)) {
    throw new Error('Currently resolving with a literal type is not supported');
  }
};

module.exports = raw;

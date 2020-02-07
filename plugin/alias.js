const { types: t } = require('@babel/core');
const { getPath } = require('./utils');
const { getConcreteTypeName } = require('./common');

const alias = (programPath, path, jpex, filename) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  const isJpexCall = (
    t.isMemberExpression(callee) &&
    jpex.includes(callee.object.name) &&
    callee.property.name === 'alias'
  );

  if (!isJpexCall) {
    return;
  }

  if (args.length !== 1) {
    return;
  }

  const type = getPath([ 'node', 'typeParameters', 'params', '0' ], path);
  const name = getConcreteTypeName(type, filename, programPath);
  if (name != null) {
    args.unshift(t.stringLiteral(name));
  }
};

module.exports = alias;

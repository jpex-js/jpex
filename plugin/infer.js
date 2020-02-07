const { types: t } = require('@babel/core');
const { getPath } = require('./utils');
const { getConcreteTypeName } = require('./common');

const infer = (programPath, path, jpex, filename) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  const isJpexCall = (
    t.isMemberExpression(callee) &&
    jpex.includes(callee.object.name) &&
    callee.property.name === 'infer'
  );

  if (!isJpexCall) {
    return;
  }

  const type = getPath([ 'node', 'typeParameters', 'params', '0' ], path);
  const name = getConcreteTypeName(type, filename, programPath);

  if (name != null) {
    path.replaceWith(
      t.stringLiteral(name)
    );
  }
};

module.exports = infer;

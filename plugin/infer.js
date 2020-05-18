const { types: t } = require('@babel/core');
const { getPath } = require('./utils');
const { getConcreteTypeName } = require('./common');

const infer = (programPath, path, { identifier, filename, publicPath }) => {
  const callee = path.node.callee;

  const isJpexCall = (
    t.isMemberExpression(callee) &&
    identifier.includes(callee.object.name) &&
    callee.property.name === 'infer'
  );

  if (!isJpexCall) {
    return;
  }

  const type = getPath([ 'node', 'typeParameters', 'params', '0' ], path);
  const name = getConcreteTypeName(type, filename, publicPath, programPath);

  if (name != null) {
    path.replaceWith(
      t.stringLiteral(name)
    );
  }
};

module.exports = infer;

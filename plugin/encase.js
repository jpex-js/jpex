const { types: t } = require('@babel/core');
const { extractFunctionParameterTypes } = require('./common');

const encase = (programPath, path, jpex, filename) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  const isJpexCall = (
    t.isMemberExpression(callee) &&
    jpex.includes(callee.object.name) &&
    callee.property.name === 'encase'
  );

  if (!isJpexCall) {
    return;
  }

  if (args.length !== 1) {
    return;
  }

  const arg = path.get('arguments.0');
  const deps = extractFunctionParameterTypes(programPath, arg, filename);
  if (deps.length) {
    path.node.arguments.splice(0, 0, t.arrayExpression(deps.map((dep) => t.stringLiteral(dep))));
  }
};

module.exports = encase;

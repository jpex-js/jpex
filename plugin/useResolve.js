const { types: t } = require('@babel/core');
const { getPath } = require('./utils');
const { getConcreteTypeName } = require('./common');

const importVisitor = {
  ImportSpecifier(path, state) {
    if (path.node.imported.name === 'useResolve') {
      if (path.node.local.name === 'useResolve') {
        if (path.parent.source.value === 'react-jpex') {
          state.found = true;
        }
      }
    }
  },
};

const resolve = (programPath, path, jpex, filename) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  if (!callee || callee.name !== 'useResolve') {
    return;
  }
  const state = { found: false };
  programPath.traverse(importVisitor, state);

  if (!state.found) {
    return;
  }

  if (args.length > 1) {
    return;
  }
  if (args.length === 1) {
    if (!t.isArrayExpression(args[0])) {
      return;
    }
  }

  const type = getPath([ 'node', 'typeParameters', 'params', '0' ], path);
  const name = getConcreteTypeName(type, filename, programPath);
  if (name != null) {
    args.unshift(t.stringLiteral(name));
  } else if (t.isTSTypeLiteral(type) || t.isTSFunctionType(type)) {
    throw new Error('Currently resolving with a literal type is not supported');
  }
};

module.exports = resolve;

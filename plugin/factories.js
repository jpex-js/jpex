const { types: t } = require('@babel/core');
const { getPath } = require('./utils');
const { extractFunctionParameterTypes, getConcreteTypeName } = require('./common');

const FACTORY_METHODS = [
  'factory',
  'service',
  'constant',
];

const factories = (programPath, path, jpex, filename) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  const isJpexCall = (
    t.isMemberExpression(callee) &&
    jpex.includes(callee.object.name) &&
    FACTORY_METHODS.includes(callee.property.name)
  );

  if (!isJpexCall) {
    return;
  }

  // do we have an interface to use as the registrant name?
  // if there is only 1 arg then we can't possibly have been given the name
  // if the first arg isn't a string, then we also don't have a name
  if (args.length === 1 || !t.isStringLiteral(args[0])) {
    const type = getPath([ 'node', 'typeParameters', 'params', '0' ], path);

    const name = getConcreteTypeName(type, filename, programPath);
    if (name != null) {
      args.unshift(t.stringLiteral(name));
    }
  }

  // do we need to infer the dependencies?
  // ignore constants as there are no dependencies
  // if the second parameter isn't an array of dependencies, it means it's inferred
  if (callee.property.name !== 'constant' && !t.isArrayExpression(path.node.arguments[1])) {
    const arg = path.get('arguments.1');
    const deps = extractFunctionParameterTypes(programPath, arg, filename);
    if (deps.length) {
      path.node.arguments.splice(1, 0, t.arrayExpression(deps.map((dep) => t.stringLiteral(dep))));
    }
  }
};

module.exports = factories;

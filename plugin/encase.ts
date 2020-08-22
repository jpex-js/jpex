import { types as t, NodePath } from '@babel/core';
import {
  extractFunctionParameterTypes,
  isJpexCall,
  State,
} from './common';

const encase = (
  programPath: NodePath<t.Program>,
  path: NodePath<any>,
  {
    identifier,
    filename,
    publicPath,
  }: State,
) => {
  const args = path.node.arguments;

  if (!isJpexCall(path, identifier, 'encase')) {
    return;
  }

  if (args.length !== 1) {
    return;
  }

  const arg = path.get('arguments.0') as NodePath<any>;
  const deps = extractFunctionParameterTypes(programPath, arg, filename, publicPath);
  path.node.arguments.splice(0, 0, t.arrayExpression(deps.map((dep) => t.stringLiteral(dep))));
};

export default encase;

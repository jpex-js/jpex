import { types as t, NodePath } from '@babel/core';
import {
  getConcreteTypeName,
  isJpexCall,
  State,
  getTypeParameter,
} from './common';

const clearCache = (
  programPath: NodePath<t.Program>,
  path: NodePath<any>,
  {
    identifier,
    filename,
    publicPath,
  }: State) => {
  const args = path.node.arguments;

  if (!isJpexCall(path, identifier, 'clearCache')) {
    return;
  }
  if (args.length === 0) {
    const type = getTypeParameter(path);
    const name = getConcreteTypeName(type, filename, publicPath, programPath);
    if (name != null) {
      args.unshift(t.stringLiteral(name));
    }
  }
};

export default clearCache;

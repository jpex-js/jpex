import { types as t, NodePath } from '@babel/core';
import {
  getConcreteTypeName,
  isJpexCall,
  State,
  getTypeParameter,
} from './common';

const alias = (
  programPath: NodePath<t.Program>,
  path: NodePath<any>,
  {
    identifier,
    filename,
    publicPath,
  }: State
) => {
  const args = path.node.arguments;

  if (!isJpexCall(path, identifier, 'alias')) {
    return;
  }

  if (args.length === 2) {
    return;
  }

  // eslint-disable-next-line no-plusplus
  for (let x = 0; x < 2; x++) {
    const type = getTypeParameter(path, x);
    const name = getConcreteTypeName(type, filename, publicPath, programPath);
    if (name != null) {
      args.unshift(t.stringLiteral(name));
    }
  }
};

export default alias;

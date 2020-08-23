import { types as t, NodePath } from '@babel/core';
import {
  getConcreteTypeName,
  State,
  getTypeParameter,
  isJpexCall,
} from './common';

const resolveWith = (
  programPath: NodePath<t.Program>,
  path: NodePath<any>,
  {
    identifier,
    filename,
    publicPath,
  }: State,
) => {
  const args = path.node.arguments;

  if (!isJpexCall(path, identifier, 'resolveWith')) {
    return;
  }

  const type = getTypeParameter(path);
  const name = getConcreteTypeName(type, filename, publicPath, programPath);
  if (name != null) {
    args.unshift(t.stringLiteral(name));
  } else if (t.isTSTypeLiteral(type) || t.isTSFunctionType(type)) {
    throw new Error('Currently resolving with a literal type is not supported');
  } else {
    return;
  }

  if (!t.isArrayExpression(args[1])) {
    return;
  }

  const namedDependencies: t.ObjectProperty[] = [];
  let i = 1;
  let namedType = getTypeParameter(path, i);
  while (namedType) {
    const name = getConcreteTypeName(namedType, filename, publicPath, programPath);
    if (name != null) {
      const value = args[1].elements[i - 1];
      const key = t.stringLiteral(name);
      // @ts-ignore
      const prop = t.objectProperty(key, value);
      namedDependencies.push(prop);
    } else if (t.isTSTypeLiteral(type) || t.isTSFunctionType(type)) {
      throw new Error('Currently resolving with a literal type is not supported');
    }
    // eslint-disable-next-line no-plusplus
    namedType = getTypeParameter(path, ++i);
  }

  args.splice(1, 1, t.objectExpression(namedDependencies));
};

export default resolveWith;

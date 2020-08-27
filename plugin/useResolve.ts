import { types as t, Visitor, NodePath } from '@babel/core';
import {
  getConcreteTypeName,
  State,
  getTypeParameter,
} from './common';

const importVisitor: Visitor<{
  found: boolean,
}> = {
  ImportSpecifier(path, state) {
    if (path.node.imported.name === 'useResolve') {
      if (path.node.local.name === 'useResolve') {
        // @ts-ignore
        if (path.parent.source.value === 'react-jpex') {
          state.found = true;
        }
      }
    }
  },
};

const useResolve = (
  programPath: NodePath<t.Program>,
  path: NodePath<any>,
  {
    filename,
    publicPath,
  }: State,
) => {
  const callee = path.node.callee;
  const args = path.node.arguments;

  if (callee?.name !== 'useResolve') {
    return;
  }
  const state = { found: false };
  programPath.traverse(importVisitor, state);

  if (!state.found) {
    return;
  }

  if (args.length > 0 && t.isStringLiteral(args[0])) {
    return;
  }

  const type = getTypeParameter(path);
  const name = getConcreteTypeName(type, filename, publicPath, programPath);
  if (name != null) {
    args.unshift(t.stringLiteral(name));
  } else if (t.isTSTypeLiteral(type) || t.isTSFunctionType(type)) {
    throw new Error('Currently resolving with a literal type is not supported');
  }
};

export default useResolve;

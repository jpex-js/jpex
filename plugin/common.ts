import { types as t, Visitor, NodePath } from '@babel/core';
import { join, dirname } from 'path';
import cache from './cache';

export interface State {
  identifier: string[],
  filename: string,
  publicPath: string,
}

export const isJpexCall = (
  path: NodePath<any>,
  identifier: string[],
  key: string | string[],
) => {
  const callee = path.node.callee;
  if (!t.isMemberExpression(callee)) {
    return false;
  }
  // @ts-ignore
  if (!identifier.includes(callee.object.name)) {
    return false;
  }
  if (Array.isArray(key)) {
    // @ts-ignore
    return key.includes(callee.property.name);
  }
  // @ts-ignore
  return callee.property.name === key;
};

export const getTypeParameter = (path: NodePath<any>, i = 0): t.Node => {
  return path.node?.typeParameters?.params?.[i];
};

const typeSourceVisitor: Visitor<{
  typeName: string,
  filename: string,
  publicPath: string,
  name: string,
}> = {
  TSType(path, state) {
    // FIXME: I can't work out what type of node `parent` should be
    const parent = path.parent as any;
    const parentName: string = parent?.id?.name;
    if (parentName !== state.typeName) {
      return;
    }
    const key = `${state.filename}/${state.typeName}`;
    if (!cache[key]) {
      const usePublicPath = state.publicPath && parent?.source?.value?.[0] === '.';
      const value = `${usePublicPath ? state.publicPath : state.filename}/${state.typeName}`;
      cache[key] = value;
    }
    const id = cache[key];
    state.name = id;
  },
  TSInterfaceDeclaration(path, state) {
    if (path.node.id.name !== state.typeName) {
      return;
    }
    // FIXME: not sure what type of node parent is
    const parent = path.parent as any;
    const key = `${state.filename}/${state.typeName}`;
    if (!cache[key]) {
      const usePublicPath = state.publicPath && parent?.source?.value?.[0] === '.';
      const value = `${usePublicPath ? state.publicPath : state.filename}/${state.typeName}`;
      cache[key] = value;
    }
    const id = cache[key];
    state.name = id;
  },
  ImportSpecifier(path, state) {
    if (path.node.local.name !== state.typeName) {
      return;
    }
    const parent = path.parent as any;
    let source: string = parent.source.value;
    if (parent.source.value.charAt(0) === '.') {
      source = join(dirname(state.filename), source);
    }
    const key = `${source}/${path.node.imported.name}`;
    if (!cache[key]) {
      const usePublicPath = state.publicPath && parent?.source?.value?.[0] === '.';
      const value = usePublicPath ? `${state.publicPath}/${path.node.imported.name}` : key;
      cache[key] = value;
    }
    const id = cache[key];
    state.name = id;
  },
};

export const getConcreteTypeName = (
  typeNode: t.Node,
  filename: string,
  publicPath: string,
  programPath: NodePath<t.Program>,
) => {
  if (t.isTSTypeReference(typeNode)) {
    // @ts-ignore
    const name: string = typeNode?.typeName?.name;
    if (name == null) {
      return null;
    }
    const state = {
      filename,
      publicPath,
      programPath,
      typeName: name,
      name: null as string,
    };
    programPath.traverse(typeSourceVisitor, state);
    if (state.name) {
      return `type:${state.name}`;
    }
    return `type:global:${name}`;
  }
  if (t.isTSTypeLiteral(typeNode) || t.isTSFunctionType(typeNode)) {
    throw new Error('Currently registering with a literal type is not supported');
  }
};

const tsTypeAnnotationVisitor: Visitor<{
  key: string,
  filename: string,
  publicPath: string,
  programPath: NodePath<t.Program>
}> = {
  TSTypeAnnotation(path, state) {
    const name = getConcreteTypeName(
      path.node.typeAnnotation,
      state.filename,
      state.publicPath,
      state.programPath,
    );
    state.key = name == null ? 'unknown' : name;
  },
};

const getFunctionParams = (
  // eslint-disable-next-line max-len
  path: NodePath<t.ClassMethod> | NodePath<t.ArrowFunctionExpression> | NodePath<t.FunctionDeclaration> | NodePath<t.FunctionExpression>,
  deps: string[],
  filename: string,
  publicPath: string,
  programPath: NodePath<t.Program>,
) => {
  [].concat(path.get('params')).forEach((path) => {
    const ctx = {
      key: path.node.name,
      filename,
      programPath,
      publicPath,
    };
    path.traverse(tsTypeAnnotationVisitor, ctx);
    deps.push(ctx.key);
  });
};

const classConstructorVisitor: Visitor<{
  deps: string[],
  filename: string,
  programPath: NodePath<t.Program>,
  publicPath: string,
}> = {
  ClassMethod(path, state) {
    const { deps, filename, programPath, publicPath } = state;
    // @ts-ignore
    if (path.node.key.name === 'constructor') {
      getFunctionParams(path, deps, filename, publicPath, programPath);
    }
  },
};

const linkedVariableVisitor: Visitor<{
  deps: string[],
  name: string,
  filename: string,
  publicPath: string,
  programPath: NodePath<t.Program>,
}> = {
  Class(path, state) {
    const {
      deps,
      name,
      filename,
      programPath,
      publicPath,
    } = state;
    if (path.node.id?.name === name) {
      path.traverse(classConstructorVisitor, {
        deps,
        filename,
        programPath,
        publicPath,
      });
    }
  },
  ArrowFunctionExpression(path, state) {
    const { deps, name, filename, programPath, publicPath } = state;
    const { parent } = path;
    // @ts-ignore
    if (parent?.id?.name === name) {
      getFunctionParams(path, deps, filename, publicPath, programPath);
    }
  },
  FunctionDeclaration(path, state) {
    const { deps, name, filename, programPath, publicPath } = state;
    const { node } = path;
    if (node && node.id && node.id.name === name) {
      getFunctionParams(path, deps, filename, publicPath, programPath);
    }
  },
  FunctionExpression(path, state) {
    const { deps, name, filename, programPath, publicPath } = state;
    const { parent } = path;
    // @ts-ignore
    if (parent?.id?.name === name) {
      getFunctionParams(path, deps, filename, publicPath, programPath);
    }
  },
};

export const extractFunctionParameterTypes = (
  programPath: NodePath<t.Program>,
  arg: NodePath<any>,
  filename: string,
  publicPath: string,
) => {
  const deps: string[] = [];
  const ctx = {
    deps,
    programPath,
    filename,
    publicPath,
  };
  if (t.isIdentifier(arg)) {
    programPath.traverse(linkedVariableVisitor, Object.assign({ name: arg.node.name }, ctx));
  } else if (t.isClass(arg)) {
    arg.traverse(classConstructorVisitor, ctx);
  } else if (t.isArrowFunctionExpression(arg)) {
    getFunctionParams(arg, deps, filename, publicPath, programPath);
  } else if (t.isFunctionExpression(arg)) {
    getFunctionParams(arg, deps, filename, publicPath, programPath);
  }
  return deps;
};

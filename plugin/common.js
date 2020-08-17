const { types: t } = require('@babel/core');
const { join, dirname } = require('path');
const { getPath } = require('./utils');
const cache = require('./cache');

const typeSourceVisitor = {
  TSType(path, state) {
    const parentName = getPath([ 'parent', 'id', 'name' ], path);
    if (parentName !== state.typeName) {
      return;
    }
    const key = `${state.filename}/${state.typeName}`;
    if (!cache[key]) {
      const usePublicPath = state.publicPath && path.parent.source && path.parent.source.value[0] === '.';
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
    const key = `${state.filename}/${state.typeName}`;
    if (!cache[key]) {
      const usePublicPath = state.publicPath && path.parent.source && path.parent.source.value[0] === '.';
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
    let source = path.parent.source.value;
    if (path.parent.source.value.charAt(0) === '.') {
      source = join(dirname(state.filename), source);
    }
    const key = `${source}/${path.node.imported.name}`;
    if (!cache[key]) {
      const usePublicPath = state.publicPath && path.parent.source.value[0] === '.';
      const value = usePublicPath ? `${state.publicPath}/${path.node.imported.name}` : key;
      cache[key] = value;
    }
    const id = cache[key];
    state.name = id;
  },
};

const getConcreteTypeName = (typeNode, filename, publicPath, programPath) => {
  if (t.isTSTypeReference(typeNode)) {
    const name = getPath([ 'typeName', 'name' ], typeNode);
    if (name == null) {
      return null;
    }
    const state = {
      filename,
      publicPath,
      programPath,
      typeName: name,
      name: null,
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

const tsTypeAnnotationVisitor = {
  TSTypeAnnotation(path, state) {
    const name = getConcreteTypeName(path.node.typeAnnotation, state.filename, state.publicPath, state.programPath);
    state.key = name == null ? 'unknown' : name;
  },
};

const getFunctionParams = (path, deps, filename, publicPath, programPath) => {
  path.get('params').forEach((path) => {
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

const classConstructorVisitor = {
  ClassMethod(path, state) {
    const { deps, filename, programPath, publicPath } = state;
    if (path.node.key.name === 'constructor') {
      getFunctionParams(path, deps, filename, publicPath, programPath);
    }
  },
};

const linkedVariableVisitor = {
  Class(path, state) {
    const { deps, name } = state;
    if (path.node.id.name === name) {
      path.traverse(classConstructorVisitor, { deps });
    }
  },
  ArrowFunctionExpression(path, state) {
    const { deps, name, filename, programPath, publicPath } = state;
    const { parent } = path;
    if (parent && parent.id && parent.id.name === name) {
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
    if (parent && parent.id && parent.id.name === name) {
      getFunctionParams(path, deps, filename, publicPath, programPath);
    }
  },
};

const extractFunctionParameterTypes = (programPath, arg, filename, publicPath) => {
  const deps = [];
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

module.exports = {
  getConcreteTypeName,
  extractFunctionParameterTypes,
};

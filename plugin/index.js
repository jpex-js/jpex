const { declare } = require('@babel/helper-plugin-utils');
const handleFactoryCalls = require('./factories');
const handleResolveCall = require('./resolve');
const handleResolveWithCall = require('./resolveWith');
const handleAliasCall = require('./alias');
const handleEncaseCall = require('./encase');
const handleInferCall = require('./infer');
const handleRawCall = require('./raw');
const handleUseResolve = require('./useResolve');

const mainVisitor = {
  CallExpression(path, state) {
    const { programPath } = this;
    let {
      opts: {
        identifier = 'jpex',
        publicPath,
      } = {},
    } = state;
    const filename = this
      .filename
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(process.cwd(), '');
    identifier = [].concat(identifier);
    const opts = {
      identifier,
      filename,
      publicPath,
    };
    handleFactoryCalls(programPath, path, opts);
    handleResolveCall(programPath, path, opts);
    handleResolveWithCall(programPath, path, opts);
    handleEncaseCall(programPath, path, opts);
    handleAliasCall(programPath, path, opts);
    handleInferCall(programPath, path, opts);
    handleRawCall(programPath, path, opts);
    handleUseResolve(programPath, path, opts);
  },
};

module.exports = declare(
  (api) => {
    api.assertVersion(7);

    return {
      visitor: {
        Program(programPath, state) {
          programPath.traverse(mainVisitor, {
            programPath,
            opts: state.opts,
            filename: state.file.opts.filename,
          });
        },
      },
    };
  },
);

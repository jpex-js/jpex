const { declare } = require('@babel/helper-plugin-utils');
const handleFactoryCalls = require('./factories');
const handleResolveCall = require('./resolve');
const handleResolveWithCall = require('./resolveWith');
const handleAliasCall = require('./alias');
const handleEncaseCall = require('./encase');
const handleInferCall = require('./infer');

const mainVisitor = {
  CallExpression(path, state) {
    const { programPath } = this;
    let {
      opts: {
        identifier = 'jpex',
      } = {},
    } = state;
    const filename = this
      .filename
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(process.cwd(), '');
    identifier = [].concat(identifier);
    handleFactoryCalls(programPath, path, identifier, filename);
    handleResolveCall(programPath, path, identifier, filename);
    handleResolveWithCall(programPath, path, identifier, filename);
    handleEncaseCall(programPath, path, identifier, filename);
    handleAliasCall(programPath, path, identifier, filename);
    handleInferCall(programPath, path, identifier, filename);
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

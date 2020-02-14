export default {
  files: [ 'src/**/*.test.ts' ],
  extensions: [ 'ts' ],
  require: [ './test-setup.js' ],
  verbose: true,
  babel: {
    compileEnhancements: false,
  },
};

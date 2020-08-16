const browserEnv = require('browser-env');
const babel = require('@babel/register');

browserEnv();
babel({
  extensions: [ '.js', '.ts' ],
  plugins: [
    [ './babel-plugin', {
      identifier: [ 'jpex', 'jpex2', 'jpex3', 'base', 'base2' ],
    }],
    [ '@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    '@babel/plugin-proposal-class-properties',
  ],
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: 'commonjs',
        useBuiltIns: false,
        loose: true,
      },
    ],
  ],
});

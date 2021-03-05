const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: [
    '@babel/preset-typescript',
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 2%'],
        },
        modules: isTest ? 'commonjs' : false,
        useBuiltIns: false,
        loose: true,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    [
      '@jpex-js/babel-plugin',
      {
        publicPath: true,
        identifier: ['jpex', 'jpex2', 'jpex3', 'base', 'base2'],
      },
    ],
  ],
};

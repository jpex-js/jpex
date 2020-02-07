module.exports = {
  plugins: [
    [ './plugin', { identifier: 'ioc' }],
    '@babel/plugin-syntax-typescript',
    '@babel/plugin-syntax-class-properties',
    '@babel/plugin-external-helpers',
  ],
};

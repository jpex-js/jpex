  
module.exports = {
  'parser': '@typescript-eslint/parser',
  'plugins': [
    '@typescript-eslint',
  ],
  'parserOptions': {
    'sourceType': 'module',
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
    },
  },
  'env': {
    'browser': true,
    'es6': true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  'rules': {
    'indent': [ 'error', 2 ],
    'linebreak-style': [ 'error', 'unix' ],
    'quotes': [ 'error', 'single' ],
    'semi': [ 'error', 'always' ],
    'arrow-parens': [ 'error', 'as-needed' ],
    'curly': [ 'error', 'all' ],
    'no-invalid-this': 'off',
    'array-bracket-spacing': [ 'error', 'always' ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'max-len': [ 'error', {
      'code': 120,
      'ignoreComments': true,
      'ignoreTemplateLiterals': true,
    } ],
    'no-unused-vars': [ 'off' ],
    '@typescript-eslint/no-unused-vars': 'error',
  },
  'settings': {
    'import/resolver': {
      'node': {
        'extensions': [ '.ts', '.js' ],
      },
      'extensions': [ '.ts', '.js' ],
    },
  },
};

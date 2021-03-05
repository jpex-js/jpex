module.exports = {
  extends: ['airbnb-typescript-prettier', 'plugin:jest/recommended'],
  plugins: ['jest'],
  rules: {
    'import/no-named-as-default': 'off',
    'consistent-return': 'off',
    'no-void': 'off',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-shadow': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
    'import/prefer-default-export': 'off',
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
  },
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  overrides: [
    {
      files: ['**/*.test.ts'],
      env: {
        jest: true,
        browser: true,
        es6: true,
      },
    },
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.js'],
      },
      extensions: ['.ts', '.js'],
    },
  },
};

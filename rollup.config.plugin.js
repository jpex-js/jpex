import babel from 'rollup-plugin-babel';
import localResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'plugin/index.ts',
  output: {
    file: 'babel-plugin.js',
    format: 'cjs',
    exports: 'default',
  },
  plugins: [
    localResolve({
      extensions: [ '.js', '.ts' ],
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: [ '.js', '.ts' ],
    }),
  ],
  external: [
    '@babel/core',
    '@babel/helper-plugin-utils',
    'path',
  ],
};

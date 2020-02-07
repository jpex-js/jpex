import babel from 'rollup-plugin-babel';
import localResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import path from 'path';

export default {
  input: 'tmp/index.ts',
  output: [
    {
      file: 'dist/es/jpex.js',
      format: 'es',
    },
    {
      file: 'dist/cjs/jpex.js',
      format: 'cjs',
    },
  ],
  plugins: [
    localResolve({
      extensions: [ '.js', '.ts' ],
    }),
    typescript({
      tsconfig: path.resolve('./tsconfig.json'),
    }),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      extensions: [ '.js', '.ts' ],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: [
                'last 2 versions',
                'safari >= 7',
              ],
            },
            modules: false,
            useBuiltIns: false,
            loose: true,
          },
        ],
      ],
      plugins: [
        [ '@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
        '@babel/plugin-proposal-class-properties',
      ],
    }),
  ],
};

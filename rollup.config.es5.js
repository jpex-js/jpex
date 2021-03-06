import babel from 'rollup-plugin-babel';
import localResolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/es5.js',
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [
    localResolve({
      extensions: ['.js', '.ts'],
    }),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.ts'],
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['last 2 versions', 'safari >= 7'],
            },
            modules: false,
            useBuiltIns: false,
            loose: true,
          },
        ],
      ],
    }),
    cleanup({
      extensions: [ 'js','ts' ],
      sourcemap: false,
    }),
  ],
};

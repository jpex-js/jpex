import babel from 'rollup-plugin-babel';
import localResolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import path from 'path';

export default {
  input: 'src/index.ts',
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
      exclude: 'node_modules/**',
      extensions: [ '.js', '.ts' ],
    }),
  ],
};

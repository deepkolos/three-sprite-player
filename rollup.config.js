import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json';

const plugins = [
  json(),
  resolve(), // so Rollup can find `ms`
  commonjs(), // so Rollup can convert `ms` to an ES module
  typescript(),
]

export default [
  // browser-friendly UMD build
  {
    input: 'src/main.ts',
    output: {
      name: 'ThreeSpritePlayer',
      file: pkg.browser,
      format: 'umd',
    },
    plugins,
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/main.ts',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
    plugins,
  },

  {
    input: 'src/cli.ts',
    output: {
      file: pkg.bin['tsp-cli'],
      format: 'cjs',
    },
    plugins,
  }
];

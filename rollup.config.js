import json from '@rollup/plugin-json';
import addCliEntry from './add-cli-entry';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import sucrase from '@rollup/plugin-sucrase';
import pkg from './package.json';

const plugins = [
  json(),
  resolve({ jail: 'jimp', preferBuiltins: true }), // so Rollup can find `ms`
  commonjs(), // so Rollup can convert `ms` to an ES module
  sucrase({ transforms: ['typescript'] }),
  addCliEntry(),
];

export default [
  // browser-friendly UMD build
  {
    input: 'src/main.ts',
    output: {
      name: 'ThreeSpritePlayer',
      file: pkg.browser,
      format: 'umd',
    },
    external: ['jimp'],
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
      { file: pkg.main, format: 'cjs', exports: 'auto' },
      { file: pkg.module, format: 'es' },
      { file: './examples/mini-program/tsp.js', format: 'es' },
    ],
    plugins,
  },

  {
    input: 'src/main-cli.ts',
    output: {
      file: pkg.bin['tsp-cli'],
      format: 'cjs',
      exports: 'auto',
    },
    plugins,
  },
];

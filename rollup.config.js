/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import summary from 'rollup-plugin-summary';
import {terser} from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import multiInput from 'rollup-plugin-multi-input';
import multi from '@rollup/plugin-multi-entry';

const commonOptions = {
  input: ['build/src/oe-*.js'],
  output:{
    dir: 'build/dist',
    format: 'esm',
    chunkFileNames: 'oe-shared-[hash].js',
  },
  onwarn(warning) {
    if (warning.code !== 'THIS_IS_UNDEFINED') {
      console.error(`(!) ${warning.message}`);
    }
  },
  plugins: [
    replace({'Reflect.decorate': 'undefined', preventAssignment: false}),
    resolve(),
    terser({
      ecma: 2017,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),
    summary()
  ]
};

// individual components
const individual = Object.assign({} , commonOptions, {
  plugins: commonOptions.plugins.concat(
    multiInput({ relative: 'build/src/' })
  )
});

const bundle = Object.assign({} , commonOptions, {
  plugins: commonOptions.plugins.concat(
    multi({ entryFileName: 'oe-components.all.js' })
  )
});

export default [
  individual,
  bundle
]


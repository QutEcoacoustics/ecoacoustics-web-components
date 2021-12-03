/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Import rollup plugins
import html from '@web/rollup-plugin-html';
import {copy} from '@web/rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import summary from 'rollup-plugin-summary';
import replace from '@rollup/plugin-replace';
import multiInput from 'rollup-plugin-multi-input';
import multi from '@rollup/plugin-multi-entry';

const commonOptions = {
  input: ['build/src/oe-*.js'],
  output: {
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

    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app
    html({input: './dev/index.html'}),

    // Resolve bare module specifiers to relative paths
    resolve(),

    // Minify HTML template literals
    minifyHTML(),

    // Minify JS
    terser({
      ecma: 2020,
      module: true,
      warnings: true,
      mangle: {
        properties: {
          regex: /^__/,
        },
      },
    }),

    // Print bundle summary
    summary(),

    // Optional: copy any static assets to build directory
    copy({patterns: ['dev/assets/*.wav']}),
  ],
};

// individual components
const individual = Object.assign({}, commonOptions, {
  plugins: commonOptions.plugins.concat(multiInput({relative: 'build/src/'})),
});

const bundle = Object.assign({}, commonOptions, {
  plugins: commonOptions.plugins.concat(multi({entryFileName: 'oe-components.all.js'})),
});

export default [individual, bundle];

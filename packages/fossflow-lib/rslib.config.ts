import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react';

const packageJson = require('./package.json');

// The in-app "Help > GitHub" link opens this in a browser, so drop the
// clone-oriented `.git` suffix that npm manifests carry.
const REPOSITORY_URL = String(packageJson.repository.url).replace(/\.git$/, '');

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      syntax: 'es2021',
      output: {
        distPath: { root: './dist' },
      },
      style: {
        inject: false,
      },
    },
  ],
  plugins: [pluginReact()],
  source: {
    entry: {
      index: './src/index.ts',
    },
    define: {
      PACKAGE_VERSION: JSON.stringify(packageJson.version),
      REPOSITORY_URL: JSON.stringify(REPOSITORY_URL),
    },
  },
  resolve: {
    alias: {
      src: './src',
      components: './src/components',
      stores: './src/stores',
      styles: './src/styles',
      utils: './src/utils',
      hooks: './src/hooks',
      types: './src/types',
    },
  },
  output: {
    externals: ['react', 'react-dom'],
    target: 'node',
    filename: {
      css: 'styles.css',
    },
  },
});

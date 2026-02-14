import path from 'path'
import { fileURLToPath } from 'url'

import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser'
import copy from 'rollup-plugin-copy'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = (...args) => path.resolve(__dirname, 'src', ...args)
const dist = (...args) => path.resolve(__dirname, 'dist', ...args)

// All runtime dependencies should be external (not bundled)
const externalDeps = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'react-is',
  '@floating-ui/react-dom',
  'clsx',
  'lodash',
  'lodash-es',
  'debug',
]

const isExternal = (id) => {
  if (id.startsWith('@babel/runtime')) return true
  return externalDeps.some((dep) => id === dep || id.startsWith(dep + '/'))
}

// Resolve plugin for directory/extension resolution (all builds need this)
const resolvePlugin = () => resolve({ extensions: ['.js', '.jsx', '.ts', '.tsx'] })

// Shared babel plugin config
const babelPlugin = (envOverrides = {}) =>
  babel({
    babelHelpers: 'runtime',
    exclude: 'node_modules/**',
    envName: envOverrides.envName || 'build',
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  })

// ─── CommonJS Build ──────────────────────────────────────────────────
const cjsConfig = {
  input: src('index.js'),
  external: isExternal,
  output: {
    dir: dist('commonjs'),
    format: 'cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    exports: 'named',
    interop: 'auto',
    banner: '"use client";',
  },
  plugins: [
    resolvePlugin(),
    babelPlugin({ envName: 'build' }),
    copy({
      targets: [{ src: 'src/**/*.d.ts', dest: 'dist/commonjs' }],
      flatten: false,
    }),
  ],
}

// ─── ES Module Build ─────────────────────────────────────────────────
const esmConfig = {
  input: src('index.js'),
  external: isExternal,
  output: {
    dir: dist('es'),
    format: 'es',
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  plugins: [
    resolvePlugin(),
    babelPlugin({ envName: 'build-es' }),
  ],
}

// ─── Browser ESM Bundle (replaces UMD) ───────────────────────────────
const browserConfig = {
  input: src('index.js'),
  external: ['react', 'react-dom', 'react/jsx-runtime', 'react-is'],
  output: {
    file: dist('esm', 'semantic-ui-react.mjs'),
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolvePlugin(),
    commonjs({ exclude: 'src/**' }),
    babelPlugin({ envName: 'build-es' }),
    terser({
      output: { comments: false },
    }),
  ],
}

export default [cjsConfig, esmConfig, browserConfig]

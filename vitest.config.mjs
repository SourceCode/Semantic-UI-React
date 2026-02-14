import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Custom Vite plugin that transforms all .js and .ts files through Babel.
 * This handles both JSX syntax in .js files and the non-standard
 * `export X from './X'` syntax used throughout the codebase.
 */
function babelTransformPlugin() {
  let babel

  return {
    name: 'babel-transform',
    enforce: 'pre',
    async configResolved() {
      babel = await import('@babel/core')
    },
    async transform(code, id) {
      if (id.includes('node_modules')) return null
      if (!/\.[jt]sx?$/.test(id)) return null

      // Only transform files that need it (contain JSX or export-default-from)
      const needsJsx = code.includes('<') && (code.includes('/>') || code.includes('</'))
      const needsExportDefault = /export\s+\w+\s+from\s+['"]/.test(code)
      const needsExportMulti = /export\s+\w+,\s*\{/.test(code)

      if (!needsJsx && !needsExportDefault && !needsExportMulti) return null

      const result = await babel.transformAsync(code, {
        filename: id,
        configFile: false,
        babelrc: false,
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }],
          id.endsWith('.ts') || id.endsWith('.tsx')
            ? ['@babel/preset-typescript', { isTSX: true, allExtensions: true }]
            : null,
        ].filter(Boolean),
        plugins: ['@babel/plugin-proposal-export-default-from'],
        sourceMaps: true,
        sourceFileName: id,
      })

      if (result) {
        return {
          code: result.code,
          map: result.map,
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [babelTransformPlugin()],

  test: {
    // DOM environment
    environment: 'jsdom',

    // Setup files (runs before each test file)
    setupFiles: ['./test/setup.js'],

    // Test file patterns
    include: [
      'test/specs/**/*-test.{js,ts,jsx,tsx}',
      'test/integration/**/*.test.{js,ts,jsx,tsx}',
    ],

    // Global APIs (describe, it, expect, vi) available without import
    globals: true,

    // Auto-restore mocks after each test (replaces sinon sandbox.restore)
    restoreMocks: true,

    // Coverage configuration (replaces karma-coverage)
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text', 'text-summary'],
      reportsDirectory: 'coverage',
      include: ['src/**/*.{js,ts,jsx,tsx}'],
      exclude: [
        'src/**/index.js',
        'src/**/*.d.ts',
      ],
    },

    // Timeout for individual tests
    testTimeout: 10000,

    // Report slow tests
    slowTestThreshold: 100,

    // Watch mode exclude patterns
    watchExclude: ['node_modules', 'dist'],

    // Suppress React 19 concurrent rendering recovery errors.
    // React throws these internally when DOM nesting violations occur (e.g. <div> inside <tr>)
    // but catches them and falls back to synchronous rendering. They are harmless.
    onUnhandledError(error) {
      if (
        error?.message?.includes(
          'error during concurrent rendering but React was able to recover',
        )
      ) {
        return
      }
      throw error
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      'semantic-ui-react': path.resolve(__dirname, 'src/index.js'),
      'src': path.resolve(__dirname, 'src'),
      'test': path.resolve(__dirname, 'test'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
})

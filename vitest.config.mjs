import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  test: {
    // DOM environment
    environment: 'jsdom',

    // Setup files (runs before each test file)
    setupFiles: ['./test/setup.js'],

    // Test file patterns
    include: ['test/specs/**/*-test.{js,ts,jsx,tsx}'],

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

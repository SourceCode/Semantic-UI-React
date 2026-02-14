import js from '@eslint/js'
import babelParser from '@babel/eslint-parser'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import importPlugin from 'eslint-plugin-import'
import reactCompiler from 'eslint-plugin-react-compiler'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'

export default [
  // ── Global ignores ───────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      'docs/dist/**',
      'coverage/**',
      'node_modules/**',
      '.yarn/**',
      'bundle-size/dist/**',
      'tmp/**',
    ],
  },

  // ── Base: eslint recommended ─────────────────────────────────────────
  js.configs.recommended,

  // ── JavaScript files (Babel parser) ──────────────────────────────────
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: true,
      },
      globals: {
        ...globals.browser,
        process: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-compiler': reactCompiler,
      'jsx-a11y': jsxA11yPlugin,
      import: importPlugin,
    },
    rules: {
      // React Compiler
      'react-compiler/react-compiler': 'error',

      // React hooks (explicit rules — v7 recommended config is now flat-config shaped)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React 19: Prevent deprecated Context.Provider pattern
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXMemberExpression[property.name='Provider']",
          message:
            'Use <Context value={}> instead of <Context.Provider value={}>. React 19 deprecates Context.Provider.',
        },
      ],

      // Relaxed rules (ported from .eslintrc root)
      'class-methods-use-this': 'off',
      'consistent-return': 'off',
      'complexity': 'off',
      'func-names': 'off',
      'no-console': 'error',
      'no-return-assign': ['error', 'except-parens'],
      'no-underscore-dangle': 'off',
      'prefer-destructuring': 'off',

      // JSX a11y (relaxed)
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/role-has-required-aria-props': 'warn',

      // Import rules (relaxed for this codebase)
      'import/named': 'off',
      'import/no-cycle': 'off',
      'import/no-dynamic-require': 'off',
      'import/no-extraneous-dependencies': 'off',
      'import/no-unresolved': 'off',
      'import/no-webpack-loader-syntax': 'off',
      'import/extensions': 'off',

      // React recommended rules (previously from airbnb)
      'react/display-name': 'error',
      'react/jsx-key': 'error',
      'react/jsx-no-comment-textnodes': 'error',
      'react/jsx-no-duplicate-props': 'error',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-undef': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-find-dom-node': 'error',
      'react/no-is-mounted': 'error',
      'react/no-string-refs': 'error',
      'react/no-unknown-property': 'error',
      'react/no-unsafe': 'off',
      'react/prop-types': 'off',
      'react/require-render-return': 'error',

      // React rules (relaxed)
      'react/button-has-type': 'off',
      'react/destructuring-assignment': 'off',
      'react/forbid-prop-types': 'off',
      'react/jsx-curly-newline': 'off',
      'react/jsx-one-expression-per-line': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.tsx'] }],
      'react/jsx-props-no-spreading': 'off',
      'react/jsx-wrap-multilines': 'off',
      'react/prefer-stateless-function': 'off',
      'react/no-unused-prop-types': 'off',
      'react/sort-comp': 'off',
      'react/state-in-constructor': 'off',
      'react/require-default-props': 'off',
      // Automatic JSX runtime - no need for React in scope
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // ── TypeScript files ─────────────────────────────────────────────────
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
    },
  },

  // ── Test files override (replaces test/.eslintrc) ────────────────────
  {
    files: ['test/**/*.{js,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.node,
        // Vitest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: 'react-dom/test-utils',
          message: 'react-dom/test-utils is removed in React 19. Import { act } from "react" instead.',
        }],
      }],
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/control-has-associated-label': 'off',
      'jsx-a11y/tabindex-no-positive': 'off',
      'react/forbid-foreign-prop-types': 'off',
      'react/prop-types': 'off',
    },
  },

  // ── Docs override (replaces docs/.eslintrc) ──────────────────────────
  {
    files: ['docs/**/*.js'],
    languageOptions: {
      globals: {
        __DEV__: 'readonly',
        __TEST__: 'readonly',
        __PATH_SEP__: 'readonly',
        __PROD__: 'readonly',
      },
    },
    rules: {
      'jsx-a11y/alt-text': 'off',
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'react/no-array-index-key': 'off',
      'react/no-render-return-value': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },

  // ── Docs examples override (replaces docs/src/examples/.eslintrc) ───
  {
    files: ['docs/src/examples/**/*.js'],
    rules: {
      'no-restricted-imports': ['error', { patterns: ['../*', './*', 'docs/src/examples/*'] }],
    },
  },
  {
    files: ['docs/src/examples/**/index.js'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['docs/src/examples/**/*Example*.js'],
    rules: {
      'react/prop-types': 'off',
    },
  },

  // ── Scripts override (Node.js build scripts) ────────────────────────
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // ── Prettier MUST be last to override formatting rules ───────────────
  prettierConfig,
]

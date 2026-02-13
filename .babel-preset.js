const { NODE_ENV } = process.env

const isESBuild = NODE_ENV === 'build-es'
const isUMDBuild = NODE_ENV === 'build-umd'
const isLibBuild = NODE_ENV === 'build' || isESBuild || isUMDBuild
const isDocsBuild = NODE_ENV === 'development' || NODE_ENV === 'production'

// Browser targets are defined in .browserslistrc
// This aligns with React 19 minimum requirements

const plugins = [
  // React Compiler must run first to analyze original source before other transforms
  'babel-plugin-react-compiler',
  '@babel/plugin-proposal-export-default-from',
  [
    '@babel/plugin-transform-runtime',
    {
      regenerator: isDocsBuild,
      useESModules: isESBuild,
      // https://github.com/babel/babel/issues/10261
      version: require('@babel/runtime/package.json').version,
    },
  ],
  // Plugins that allow to reduce the target bundle size

  // `babel-plugin-lodash` is required for all kinds of modules to simplify the resolution of
  // modules and avoid modules that prevent tree-shaking:
  // https://github.com/lodash/lodash/issues/4119
  'lodash',
  [
    'transform-next-use-client',
    {
      customClientImports: ['useAutoControlledValue', 'useEventCallback', 'useMergedRefs'],
    },
  ],
  // CJS modules are not tree-shakable in any bundler by default
  // https://github.com/formium/tsdx#using-lodash
  (isESBuild || isUMDBuild) && [
    'babel-plugin-transform-rename-import',
    {
      replacements: [{ original: 'lodash', replacement: 'lodash-es' }],
    },
  ],

  // A plugin for removal of debug in production builds
  isLibBuild && [
    'filter-imports',
    {
      imports: {
        './makeDebugger': ['default'],
        '../../lib': ['makeDebugger'],
      },
    },
  ],
].filter(Boolean)

module.exports = (api) => {
  // When called from Rollup via @rollup/plugin-babel, modules must be false
  // because Rollup handles module format conversion itself.
  const callerName = api.caller((c) => c && c.name)
  const isRollup = callerName === '@rollup/plugin-babel'

  return {
    compact: false,
    assumptions: {
      setPublicClassFields: true,
      privateFieldsAsProperties: true,
    },
    presets: [
      [
        '@babel/env',
        {
          modules: isESBuild || isUMDBuild || isRollup ? false : 'commonjs',
          bugfixes: true,
        },
      ],
      ['@babel/react', { runtime: 'automatic' }],
      '@babel/typescript',
    ],
    plugins,
    env: {
      test: {
        plugins: [['istanbul', { include: ['src'] }]],
      },
    },
  }
}

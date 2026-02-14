# Setup

## Environment Variables

This project uses **no environment variables** for library development. The build and test tooling reads configuration from files in the repository root.

| File                  | Purpose                                   |
| --------------------- | ----------------------------------------- |
| `vitest.config.mjs`   | Test runner configuration                 |
| `rollup.config.mjs`   | Build pipeline configuration              |
| `eslint.config.mjs`   | Linting rules                             |
| `.babel-preset.js`    | Babel transpilation presets               |
| `tsconfig.json`       | TypeScript compiler options (development) |
| `tsconfig.build.json` | TypeScript compiler options (build)       |
| `.prettierrc.json`    | Code formatting rules                     |
| `.editorconfig`       | Editor formatting consistency             |

### Babel Environment Modes

The Babel preset (`.babel-preset.js`) uses `process.env.NODE_ENV` internally:

| `NODE_ENV`  | Behavior                            |
| ----------- | ----------------------------------- |
| `test`      | jsdom environment, CommonJS modules |
| `build:cjs` | Build CommonJS output               |
| `build:es`  | Build ES Modules output             |
| (default)   | Development mode                    |

These are set automatically by the build scripts in `package.json`. You do not need to set them manually.

## Project Bootstrap

After cloning and running `yarn install`:

```bash
# Verify TypeScript compilation
yarn typecheck

# Verify linting passes
yarn lint

# Run the test suite
yarn test -- --run

# Build all distribution formats
yarn build
```

## Editor Configuration

The `.editorconfig` file enforces:

- **Indent**: 2 spaces
- **Line endings**: LF
- **Charset**: UTF-8
- **Trailing whitespace**: Trimmed
- **Final newline**: Yes

### Recommended VS Code Extensions

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- EditorConfig (`editorconfig.editorconfig`)

## Secrets Management

This is an **open-source UI library** with no secrets, API keys, or credentials. There is no `.env` file required for development.

> **CI tokens** (npm publish, Codecov) are managed via GitHub Actions secrets and are never committed to the repository.

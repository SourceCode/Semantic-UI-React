# First Run

## Golden Path: Clone to Running Tests

```bash
# 1. Enable Corepack (one-time per machine)
corepack enable

# 2. Clone
git clone https://github.com/Semantic-Org/Semantic-UI-React.git
cd Semantic-UI-React

# 3. Install
yarn install

# 4. Verify
yarn typecheck && yarn lint && yarn test -- --run
```

Total time: ~2-3 minutes on a modern machine.

## Build the Library

```bash
yarn build
```

This produces:

| Output      | Path             | Format                        |
| ----------- | ---------------- | ----------------------------- |
| CommonJS    | `dist/commonjs/` | CJS modules for Node/bundlers |
| ES Modules  | `dist/es/`       | ESM for tree-shaking          |
| Browser ESM | `dist/esm/`      | Single-file browser bundle    |
| CSS         | `dist/styles/`   | Component stylesheets         |

## Run the Documentation Site

The docs site is an Astro application:

```bash
cd docs
yarn install
yarn dev
```

The docs site runs at `http://localhost:4321` by default.

## Run Tests in Watch Mode

```bash
yarn test
```

Vitest starts in watch mode by default. Press `a` to run all tests, `f` to run only failing tests, or `q` to quit.

## Build Verification (Full CI Simulation)

To verify the same checks CI runs:

```bash
yarn lint          # ESLint + Prettier
yarn typecheck     # TypeScript compilation
yarn test -- --run # Vitest (single run, no watch)
yarn build         # Rollup build
```

## Data Reset

This is a stateless UI library — there are no databases, seed data, or migrations. Simply delete `node_modules` and re-install:

```bash
rm -rf node_modules dist
yarn install
```

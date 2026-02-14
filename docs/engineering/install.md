# Install

## Prerequisites

| Requirement  | Version             | Notes                                           |
| ------------ | ------------------- | ----------------------------------------------- |
| **Node.js**  | 20+                 | LTS recommended                                 |
| **Corepack** | Built-in (Node 20+) | Manages Yarn version                            |
| **Yarn**     | 4.6.0               | Activated via Corepack, do not install globally |
| **Git**      | 2.x+                | For version control                             |

### Enable Corepack

```bash
corepack enable
```

This activates the Yarn 4.6.0 binary specified in `package.json` `packageManager` field. Do **not** install Yarn globally or via npm.

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Semantic-Org/Semantic-UI-React.git
cd Semantic-UI-React
```

### 2. Install Dependencies

```bash
yarn install
```

Yarn 4 (Berry) reads `.yarnrc.yml` and uses the Plug'n'Play or `node_modules` linker as configured.

### 3. Verify Installation

```bash
yarn typecheck
yarn lint
yarn test -- --run
```

## Installing as a Dependency

To use Semantic UI React in your own project:

```bash
# npm
npm install semantic-ui-react react react-dom

# yarn
yarn add semantic-ui-react react react-dom
```

### Peer Dependencies

| Package     | Version   |
| ----------- | --------- |
| `react`     | `^19.0.0` |
| `react-dom` | `^19.0.0` |

### CSS Setup

Import the built-in styles in your application entry point:

```js
import 'semantic-ui-react/styles'
```

Or import individual component styles for tree-shaking:

```js
import 'semantic-ui-react/styles/button.css'
import 'semantic-ui-react/styles/modal.css'
```

## Common Install Issues

| Issue                            | Resolution                                                          |
| -------------------------------- | ------------------------------------------------------------------- |
| `corepack` not found             | Upgrade Node.js to 20+ or run `npm install -g corepack`             |
| Wrong Yarn version               | Run `corepack enable` then `corepack prepare yarn@4.6.0 --activate` |
| `node_modules` permission errors | Delete `node_modules` and `yarn.lock`, re-run `yarn install`        |
| TypeScript version mismatch      | Ensure `typescript@^5.9` is installed as a devDependency            |

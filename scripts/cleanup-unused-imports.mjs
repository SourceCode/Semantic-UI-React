/**
 * Remove unused imports left over from PropTypes removal.
 * Specifically: SUI from lib imports, lodash _, and bare React imports.
 *
 * Usage: node scripts/cleanup-unused-imports.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// Run eslint and collect files with no-unused-vars
let output
try {
  output = execSync(
    'npx eslint src/ --format json',
    { cwd: ROOT, maxBuffer: 10 * 1024 * 1024, encoding: 'utf8' },
  )
} catch (e) {
  // ESLint exits with code 1 when there are errors, but still outputs JSON
  output = e.stdout || ''
}

let results
try {
  results = JSON.parse(output)
} catch (e) {
  console.error('Failed to parse ESLint output')
  process.exit(1)
}

let filesFixed = 0

for (const result of results) {
  const unusedVars = result.messages.filter(
    (m) => m.ruleId === 'no-unused-vars' && m.severity === 2,
  )

  if (unusedVars.length === 0) continue

  let content = fs.readFileSync(result.filePath, 'utf8')
  const original = content
  const relPath = path.relative(ROOT, result.filePath)

  for (const msg of unusedVars) {
    const varName = msg.message.match(/'(\w+)'/)?.[1]
    if (!varName) continue

    if (varName === 'SUI') {
      // Remove SUI from destructured lib import
      // Pattern 1: standalone import "import { ..., SUI } from '../../lib'"
      // Pattern 2: "import * as SUI from '../../lib/SUI'"
      // Pattern 3: "SUI," on its own line in a destructured import

      // Remove "SUI" or "SUI," from destructured import on same line
      content = content.replace(
        /(\bimport\s*\{[^}]*)(?:,\s*)?SUI(?:\s*,)?([^}]*\}\s*from\s*'[^']*lib')/gm,
        (match, before, after) => {
          let cleaned = before + after
          // Fix double commas
          cleaned = cleaned.replace(/,\s*,/g, ',')
          // Fix leading comma after {
          cleaned = cleaned.replace(/\{\s*,/, '{')
          // Fix trailing comma before }
          cleaned = cleaned.replace(/,\s*\}/, ' }')
          // Fix empty imports
          cleaned = cleaned.replace(/\{\s*\}/, '{ }')
          return cleaned
        },
      )

      // Remove "SUI,\r\n" on its own line in a multi-line import
      content = content.replace(/^\s*SUI,?\s*\r?\n/gm, '')

      // Remove standalone `import * as SUI from '../../lib/SUI'` or similar
      content = content.replace(/^import \* as SUI from '[^']*'\r?\n/gm, '')
    } else if (varName === '_') {
      // Remove `import _ from 'lodash'` line
      content = content.replace(/^import _ from 'lodash'\r?\n/gm, '')
    } else if (varName === 'React') {
      // Remove `import React from 'react'` if no JSX (automatic runtime handles it)
      // But only if React is truly unused (no React.xxx calls)
      const reactUsageCount = (content.match(/\bReact\b/g) || []).length
      const reactImportCount = (content.match(/import.*React.*from 'react'/g) || []).length
      if (reactUsageCount <= reactImportCount) {
        // React is only in the import statement(s), remove it
        content = content.replace(/^import React from 'react'\r?\n/gm, '')
        // Handle "import React, { ... } from 'react'" -> "import { ... } from 'react'"
        content = content.replace(
          /^import React,\s*(\{[^}]*\}\s*from\s*'react')/gm,
          'import $1',
        )
      }
    }
  }

  if (content !== original) {
    // Clean up double blank lines
    content = content.replace(/(\r?\n){3,}/g, '$1$1')

    fs.writeFileSync(result.filePath, content)
    filesFixed++
    const vars = unusedVars.map((m) => m.message.match(/'(\w+)'/)?.[1]).filter(Boolean)
    console.log(`Fixed: ${relPath} (removed: ${[...new Set(vars)].join(', ')})`)
  }
}

console.log(`\nTotal files fixed: ${filesFixed}`)

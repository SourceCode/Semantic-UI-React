/**
 * Cleanup script: Remove remaining PropTypes imports and customPropTypes references
 * from files that were already processed by remove-proptypes.mjs.
 *
 * Handles Windows \r\n line endings.
 *
 * Usage: node scripts/cleanup-proptypes-imports.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')

let filesFixed = 0

function findJsFiles(dir) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...findJsFiles(fullPath))
    } else if (entry.name.endsWith('.js')) {
      results.push(fullPath)
    }
  }
  return results
}

for (const file of findJsFiles(SRC)) {
  // Skip customPropTypes.js itself
  if (file.endsWith('customPropTypes.js')) continue

  let content = fs.readFileSync(file, 'utf8')
  const original = content

  // Remove `import PropTypes from 'prop-types'` line (handles \r\n)
  content = content.replace(/import PropTypes from 'prop-types'\r?\n/g, '')

  // Remove customPropTypes from multi-line destructured imports
  // Handle various positions: beginning, middle, end of import list
  // Pattern: "  customPropTypes,\r\n" on its own line
  content = content.replace(/\s*customPropTypes,?\r?\n/g, (match, offset) => {
    // Only remove if inside an import block
    const before = content.substring(Math.max(0, offset - 500), offset)
    if (before.includes('import') && before.includes('{') && !before.includes('}')) {
      return '\n'
    }
    return match
  })

  // Clean up any resulting empty import lines or double newlines
  content = content.replace(/\r?\n\r?\n\r?\n/g, (match) => {
    // Preserve the line ending style
    const eol = content.includes('\r\n') ? '\r\n' : '\n'
    return eol + eol
  })

  if (content !== original) {
    fs.writeFileSync(file, content)
    filesFixed++
    console.log(`Fixed: ${path.relative(ROOT, file)}`)
  }
}

console.log(`\nTotal files fixed: ${filesFixed}`)

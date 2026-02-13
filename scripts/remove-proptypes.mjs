/**
 * Migration script: Remove PropTypes from all source files.
 *
 * For each component file:
 * 1. Extract prop names from the .propTypes = { ... } block
 * 2. Replace the propTypes block with a static handledProps array
 * 3. Remove `import PropTypes from 'prop-types'`
 * 4. Remove `customPropTypes` from lib imports
 *
 * Usage: node scripts/remove-proptypes.mjs [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const SRC = path.join(ROOT, 'src')
const dryRun = process.argv.includes('--dry-run')

let filesModified = 0
let filesSkipped = 0
let totalPropsExtracted = 0

/**
 * Find all .js files recursively in a directory.
 */
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

/**
 * Extract top-level prop names from a propTypes block string.
 * Handles nested objects/arrays by tracking brace/bracket depth.
 */
function extractPropNames(propTypesBlock) {
  const props = []
  let depth = 0
  let inBlock = false

  const lines = propTypesBlock.split('\n')

  for (const line of lines) {
    // Count opening/closing braces and brackets
    for (const ch of line) {
      if (ch === '{' || ch === '[' || ch === '(') depth++
      if (ch === '}' || ch === ']' || ch === ')') depth--
    }

    // We're inside the top-level object when depth >= 1
    if (depth >= 1) {
      inBlock = true
    }

    // At depth 1, a line starting with a property key (after JSDoc comments)
    // looks like: "  propName: ..."
    if (inBlock && depth === 1) {
      const match = line.match(/^\s{2}(\w+)\s*:/)
      if (match) {
        props.push(match[1])
      }
    }
  }

  return props
}

/**
 * Process a single file: remove PropTypes and add handledProps.
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const relPath = path.relative(ROOT, filePath)
  let modified = false

  // Find all ComponentName.propTypes = { ... } blocks
  // This regex matches from ".propTypes = {" to the closing "}" at the correct depth
  const propTypesRegex = /^(\w+)\.propTypes\s*=\s*\{/gm
  const matches = []
  let match

  while ((match = propTypesRegex.exec(content)) !== null) {
    const componentName = match[1]
    const startIndex = match.index
    const blockStart = content.indexOf('{', startIndex + componentName.length)

    // Find the matching closing brace
    let depth = 0
    let endIndex = -1
    for (let i = blockStart; i < content.length; i++) {
      if (content[i] === '{') depth++
      if (content[i] === '}') {
        depth--
        if (depth === 0) {
          endIndex = i + 1
          break
        }
      }
    }

    if (endIndex === -1) {
      console.warn(`  WARNING: Could not find closing brace for ${componentName}.propTypes in ${relPath}`)
      continue
    }

    const fullBlock = content.substring(startIndex, endIndex)
    const propNames = extractPropNames(fullBlock)

    matches.push({
      componentName,
      startIndex,
      endIndex,
      fullBlock,
      propNames,
    })
  }

  if (matches.length === 0) {
    return false
  }

  // Process matches in reverse order to preserve indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const { componentName, startIndex, endIndex, propNames } = matches[i]

    if (propNames.length === 0) {
      console.warn(`  WARNING: No props extracted from ${componentName}.propTypes in ${relPath}`)
      continue
    }

    totalPropsExtracted += propNames.length

    // Build the handledProps array
    const handledPropsStr = `${componentName}.handledProps = [\n${propNames.map((p) => `  '${p}',`).join('\n')}\n]`

    // Remove any trailing newlines after the propTypes block
    let replaceEnd = endIndex
    while (replaceEnd < content.length && content[replaceEnd] === '\n') {
      replaceEnd++
    }
    // Keep one newline
    if (replaceEnd > endIndex) {
      replaceEnd--
    }

    content = content.substring(0, startIndex) + handledPropsStr + content.substring(replaceEnd)
    modified = true

    console.log(`  ${componentName}.handledProps = [${propNames.length} props]`)
  }

  // Remove `import PropTypes from 'prop-types'` line
  const propTypesImportRegex = /^import PropTypes from 'prop-types'\n/m
  if (propTypesImportRegex.test(content)) {
    content = content.replace(propTypesImportRegex, '')
    modified = true
  }

  // Remove `customPropTypes` from destructured lib imports
  // Pattern: import { ..., customPropTypes, ... } from '../../lib' (or similar path)
  const libImportRegex = /^(import\s*\{[^}]*)\bcustomPropTypes\b,?\s*([^}]*\}\s*from\s*'[^']*lib')/gm
  if (libImportRegex.test(content)) {
    content = content.replace(
      /^(import\s*\{)([^}]*)\bcustomPropTypes\b,?\s*([^}]*\}\s*from\s*'[^']*lib')/gm,
      (match, start, before, after) => {
        // Clean up leading/trailing commas and whitespace
        let combined = before + after
        // Remove double commas
        combined = combined.replace(/,\s*,/g, ',')
        // Remove leading comma after {
        combined = combined.replace(/^\s*,\s*/, '')
        // Remove trailing comma before }
        combined = combined.replace(/,\s*\}/, ' }')
        return start + combined
      },
    )
    modified = true
  }

  // Also handle the case where customPropTypes is on its own line in the import
  // e.g.,  customPropTypes,\n
  content = content.replace(/^\s*customPropTypes,?\n/gm, (match, offset) => {
    // Only remove if we're inside an import block (check if previous non-whitespace is { or ,)
    const before = content.substring(Math.max(0, offset - 200), offset)
    if (before.includes('import') && before.includes('{')) {
      modified = true
      return ''
    }
    return match
  })

  if (modified) {
    // Clean up any double blank lines that may result from removals
    content = content.replace(/\n{3,}/g, '\n\n')

    if (!dryRun) {
      fs.writeFileSync(filePath, content)
    }
    console.log(`  ✓ ${relPath}`)
    filesModified++
    return true
  }

  return false
}

// Main
console.log(`\nRemoving PropTypes from src/ files${dryRun ? ' (DRY RUN)' : ''}...\n`)

const files = findJsFiles(SRC)
console.log(`Found ${files.length} .js files in src/\n`)

for (const file of files) {
  const relPath = path.relative(ROOT, file)

  // Skip files that don't have propTypes
  const content = fs.readFileSync(file, 'utf8')
  if (!content.includes('.propTypes')) {
    filesSkipped++
    continue
  }

  // Skip customPropTypes.js itself (will be deleted separately)
  if (file.endsWith('customPropTypes.js')) {
    filesSkipped++
    continue
  }

  processFile(file)
}

console.log(`\n--- Summary ---`)
console.log(`Files modified: ${filesModified}`)
console.log(`Files skipped: ${filesSkipped}`)
console.log(`Total props extracted: ${totalPropsExtracted}`)
if (dryRun) {
  console.log(`\nThis was a DRY RUN. No files were modified. Run without --dry-run to apply changes.`)
}

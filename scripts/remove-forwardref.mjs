/**
 * Migration script: Remove React.forwardRef from all component files.
 *
 * Transforms:
 *   const X = React.forwardRef(function (props, ref) { ... })
 * To:
 *   function X({ ref, ...props }) { ... }
 *
 * Also transforms arrow function variant:
 *   const X = React.forwardRef((props, ref) => { ... })
 * To:
 *   const X = ({ ref, ...props }) => { ... }
 *
 * Usage: node scripts/remove-forwardref.mjs [--dry-run]
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

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  const original = content
  const relPath = path.relative(ROOT, filePath)

  // Pattern 1: const X = React.forwardRef(function (props, ref) {
  //   ...
  // })
  const namedFuncPattern = /^const (\w+) = React\.forwardRef\(function \(props, ref\) \{/gm
  let match

  while ((match = namedFuncPattern.exec(content)) !== null) {
    const componentName = match[0].match(/^const (\w+)/)[1]

    // Find the matching closing `})` for the forwardRef wrapper
    // We need to find the end of the function body, then the closing `)` of forwardRef
    const startIndex = match.index
    const funcBodyStart = content.indexOf('{', startIndex + match[0].length - 1)

    // Find the matching closing brace of the function body
    let depth = 0
    let funcBodyEnd = -1
    for (let i = funcBodyStart; i < content.length; i++) {
      if (content[i] === '{') depth++
      if (content[i] === '}') {
        depth--
        if (depth === 0) {
          funcBodyEnd = i
          break
        }
      }
    }

    if (funcBodyEnd === -1) {
      console.warn(`  WARNING: Could not find closing brace for ${componentName} in ${relPath}`)
      continue
    }

    // After the function body closing `}`, there should be `)` for forwardRef
    // Find it, skipping whitespace and newlines
    let closingParen = funcBodyEnd + 1
    while (closingParen < content.length && /\s/.test(content[closingParen])) {
      closingParen++
    }
    if (content[closingParen] === ')') {
      // Replace the opening pattern
      content = content.substring(0, startIndex) +
        `function ${componentName}({ ref, ...props }) {` +
        content.substring(startIndex + match[0].length, funcBodyEnd + 1) +
        content.substring(closingParen + 1)

      console.log(`  ${componentName}: forwardRef(function) -> function`)
    }
  }

  // Pattern 2: const X = React.forwardRef((props, ref) => {
  //   ...
  // })
  const arrowPattern = /^const (\w+) = React\.forwardRef\(\(props, ref\) => \{/gm

  while ((match = arrowPattern.exec(content)) !== null) {
    const componentName = match[0].match(/^const (\w+)/)[1]
    const startIndex = match.index
    const funcBodyStart = content.indexOf('{', startIndex + match[0].length - 1)

    let depth = 0
    let funcBodyEnd = -1
    for (let i = funcBodyStart; i < content.length; i++) {
      if (content[i] === '{') depth++
      if (content[i] === '}') {
        depth--
        if (depth === 0) {
          funcBodyEnd = i
          break
        }
      }
    }

    if (funcBodyEnd === -1) {
      console.warn(`  WARNING: Could not find closing brace for ${componentName} in ${relPath}`)
      continue
    }

    let closingParen = funcBodyEnd + 1
    while (closingParen < content.length && /\s/.test(content[closingParen])) {
      closingParen++
    }
    if (content[closingParen] === ')') {
      content = content.substring(0, startIndex) +
        `const ${componentName} = ({ ref, ...props }) => {` +
        content.substring(startIndex + match[0].length, funcBodyEnd + 1) +
        content.substring(closingParen + 1)

      console.log(`  ${componentName}: forwardRef(arrow) -> arrow`)
    }
  }

  // Pattern 3: const X = React.forwardRef(function X(props, ref) {
  //   ...same as pattern 1 but with named function matching component name
  // })
  const namedFuncPattern2 = /^const (\w+) = React\.forwardRef\(function \w+\(props, ref\) \{/gm

  while ((match = namedFuncPattern2.exec(content)) !== null) {
    const componentName = match[0].match(/^const (\w+)/)[1]
    const startIndex = match.index
    const funcBodyStart = content.indexOf('{', startIndex + match[0].length - 1)

    let depth = 0
    let funcBodyEnd = -1
    for (let i = funcBodyStart; i < content.length; i++) {
      if (content[i] === '{') depth++
      if (content[i] === '}') {
        depth--
        if (depth === 0) {
          funcBodyEnd = i
          break
        }
      }
    }

    if (funcBodyEnd === -1) continue

    let closingParen = funcBodyEnd + 1
    while (closingParen < content.length && /\s/.test(content[closingParen])) {
      closingParen++
    }
    if (content[closingParen] === ')') {
      content = content.substring(0, startIndex) +
        `function ${componentName}({ ref, ...props }) {` +
        content.substring(startIndex + match[0].length, funcBodyEnd + 1) +
        content.substring(closingParen + 1)

      console.log(`  ${componentName}: forwardRef(namedFunction) -> function`)
    }
  }

  // Now remove `import * as React from 'react'` if React is no longer used
  // Check if React is used anywhere besides the import
  if (content !== original) {
    const importLine = content.match(/^import \* as React from 'react'\r?\n/m)
    if (importLine) {
      // Count React usages excluding the import line
      const contentWithoutImport = content.replace(importLine[0], '')
      const reactUsages = contentWithoutImport.match(/\bReact\b/g)

      if (!reactUsages || reactUsages.length === 0) {
        content = content.replace(/^import \* as React from 'react'\r?\n/m, '')
        console.log(`    removed unused React import`)
      }
    }
  }

  if (content !== original) {
    if (!dryRun) {
      fs.writeFileSync(filePath, content)
    }
    filesModified++
    return true
  }

  filesSkipped++
  return false
}

// Main
console.log(`\nRemoving React.forwardRef from src/ files${dryRun ? ' (DRY RUN)' : ''}...\n`)

const files = findJsFiles(SRC)

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  if (!content.includes('React.forwardRef')) continue

  processFile(file)
}

console.log(`\n--- Summary ---`)
console.log(`Files modified: ${filesModified}`)
console.log(`Files skipped: ${filesSkipped}`)
if (dryRun) {
  console.log(`\nThis was a DRY RUN. No files were modified.`)
}

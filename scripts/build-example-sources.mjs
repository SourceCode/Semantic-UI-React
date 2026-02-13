/**
 * Generates exampleSources.json from documentation example files.
 * Replaces gulp-example-source plugin.
 *
 * Usage: node scripts/build-example-sources.mjs
 */
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

import { paths } from './util/paths.mjs'

const examplesSrc = 'docs/src/examples/*/*/*/!(*index).js'
const exampleSources = {}

const files = glob.sync(examplesSrc, { cwd: paths.base() })

for (const file of files) {
  try {
    const absPath = paths.base(file)
    const contents = fs.readFileSync(absPath, 'utf8')

    // Build source key from last 4 path segments, without extension
    const sourceName = file.split('/').slice(-4).join('/').slice(0, -3)
    exampleSources[sourceName] = contents
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message)
  }
}

const outputPath = paths.docsSrc('exampleSources.json')
fs.writeFileSync(outputPath, JSON.stringify(exampleSources, null, 2))
console.log(`Generated exampleSources.json with ${Object.keys(exampleSources).length} examples`)

/**
 * Generates component info JSON files from source components using react-docgen.
 * Replaces gulp-react-docgen plugin.
 *
 * Usage: node scripts/build-docgen.mjs
 */
import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

import getComponentInfo from './util/getComponentInfo.mjs'
import { paths } from './util/paths.mjs'

const componentGlobs = [
  'src/addons/*/*.js',
  'src/elements/*/*.js',
  'src/collections/*/*.js',
  'src/modules/*/*.js',
  'src/views/*/*.js',
]

const outputDir = paths.docsSrc('componentInfo')

// Ensure output dir exists
fs.mkdirSync(outputDir, { recursive: true })

let count = 0

for (const pattern of componentGlobs) {
  const files = glob.sync(pattern, { cwd: paths.base(), ignore: ['**/index.js'] })

  for (const file of files) {
    try {
      const info = getComponentInfo(file)
      const outputName = path.basename(file).replace(/\.js$/, '.info.json')
      const outputPath = path.join(outputDir, outputName)

      fs.writeFileSync(outputPath, JSON.stringify(info, null, 2))
      count++
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message)
    }
  }
}

console.log(`Generated ${count} component info files in ${outputDir}`)

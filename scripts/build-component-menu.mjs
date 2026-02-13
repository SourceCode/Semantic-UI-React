/**
 * Generates componentMenu.json from source components.
 * Replaces gulp-component-menu plugin.
 *
 * Usage: node scripts/build-component-menu.mjs
 */
import fs from 'fs'
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

const result = []

for (const pattern of componentGlobs) {
  const files = glob.sync(pattern, { cwd: paths.base(), ignore: ['**/index.js'] })

  for (const file of files) {
    try {
      const info = getComponentInfo(file)

      if (info.isParent) {
        result.push({
          displayName: info.displayName,
          type: info.type,
        })
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message)
    }
  }
}

const outputPath = paths.docsSrc('componentMenu.json')
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2))
console.log(`Generated componentMenu.json with ${result.length} entries`)

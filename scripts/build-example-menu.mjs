/**
 * Generates example menu JSON files from documentation examples.
 * Replaces gulp-example-menu plugin.
 *
 * Usage: node scripts/build-example-menu.mjs
 */
import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { glob } from 'glob'

import parseDocSection from './util/parseDocSection.mjs'
import { paths } from './util/paths.mjs'

const SECTION_ORDER = {
  Types: 1,
  States: 2,
  Content: 3,
  Variations: 4,
  Groups: 5,
  DEFAULT_ORDER: 6,
  Usage: 9,
}

const getSectionOrder = (sectionName) =>
  _.find(SECTION_ORDER, (val, key) => _.includes(sectionName, key)) || SECTION_ORDER.DEFAULT_ORDER

const examplesSectionsSrc = 'docs/src/examples/*/*/*/index.js'
const exampleFilesByDisplayName = {}

const files = glob.sync(examplesSectionsSrc, { cwd: paths.base() })

for (const file of files) {
  try {
    const absPath = paths.base(file)
    const contents = fs.readFileSync(absPath)

    const parts = file.split('/').slice(-4)
    const [, displayName, sectionName] = parts
    const { examples } = parseDocSection(contents)

    _.merge(exampleFilesByDisplayName, {
      [displayName]: {
        [sectionName]: {
          order: getSectionOrder(sectionName),
          sectionName,
          examples,
        },
      },
    })
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message)
  }
}

const outputDir = paths.docsSrc('exampleMenus')
fs.mkdirSync(outputDir, { recursive: true })

let count = 0
_.forEach(exampleFilesByDisplayName, (contents, displayName) => {
  const sortedContents = _.sortBy(contents, ['order', 'sectionName']).map(
    ({ sectionName, examples }) => ({ sectionName, examples }),
  )

  const outputPath = path.join(outputDir, `${displayName}.examples.json`)
  fs.writeFileSync(outputPath, JSON.stringify(sortedContents, null, 2))
  count++
})

console.log(`Generated ${count} example menu files in ${outputDir}`)

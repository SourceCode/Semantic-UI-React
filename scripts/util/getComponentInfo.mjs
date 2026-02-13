import _ from 'lodash'
import path from 'path'
import { builtinResolvers, defaultHandlers, parse } from 'react-docgen'
import fs from 'fs'

import parseDefaultValue from './parseDefaultValue.mjs'
import parseDocblock from './parseDocblock.mjs'
import parserCustomHandler from './parserCustomHandler.mjs'
import parseType from './parseType.mjs'
import { paths } from './paths.mjs'

const getComponentInfo = (filepath) => {
  const absPath = path.resolve(process.cwd(), filepath)

  const contents = fs.readFileSync(absPath).toString()
  const dir = path.dirname(absPath)
  const dirname = path.basename(dir)
  const filename = path.basename(absPath)
  const filenameWithoutExt = path.basename(absPath, path.extname(absPath))

  const componentName = path.parse(filename).name
  const componentType = path.basename(path.dirname(dir)).replace(/s$/, '')

  const resolver = new builtinResolvers.FindAllDefinitionsResolver()
  const components = parse(contents, {
    resolver,
    handlers: [...defaultHandlers, parserCustomHandler],
  })

  if (!components.length) {
    throw new Error(`Could not find a component definition in "${filepath}".`)
  }

  const info = components.find((component) => component.displayName === componentName)

  if (!info) {
    throw new Error(
      [
        `Failed to find a component definition for "${componentName}" in "${filepath}".`,
        'Please ensure your module defines matching React component.',
      ].join(' '),
    )
  }

  delete info.methods

  if (!info.displayName) {
    throw new Error(
      `Please check that static property "displayName" is defined on a component in "${filepath}".`,
    )
  }

  info.type = componentType

  info.isParent = filenameWithoutExt === dirname
  info.isChild = !info.isParent
  info.parentDisplayName = info.isParent ? null : dirname
  info.subcomponentName = info.isParent
    ? null
    : info.displayName.replace(info.parentDisplayName, '')

  const subcomponentRegExp = new RegExp(`^${dirname}\\w+\\.js$`)

  info.subcomponents = info.isParent
    ? fs
        .readdirSync(dir)
        .filter((file) => subcomponentRegExp.test(file))
        .map((file) => path.basename(file, path.extname(file)))
    : null

  info.apiPath = info.isChild
    ? `${info.parentDisplayName}.${info.subcomponentName}`
    : info.displayName

  info.componentClassName = (info.isChild
    ? info.subcomponentName.replace(/Group$/, `${info.parentDisplayName}s`)
    : info.displayName
  ).toLowerCase()

  info.docblock = parseDocblock(info.description)
  delete info.description

  info.examplesExist = false

  if (info.isParent) {
    info.examplesExist = fs.existsSync(
      paths.docsSrc(`examples/${componentType}s/${dirname}/index.js`),
    )
  }

  info.repoPath = absPath
    .replace(`${process.cwd()}${path.sep}`, '')
    .replace(new RegExp(_.escapeRegExp(path.sep), 'g'), '/')
  info.filename = filename
  info.filenameWithoutExt = filenameWithoutExt

  _.each(info.props, (propDef, propName) => {
    const { description, tags } = parseDocblock(propDef.description)
    const { name, value } = parseType(propName, propDef)

    info.props[propName] = {
      ...propDef,
      description,
      tags,
      value,
      defaultValue: parseDefaultValue(propDef),
      name: propName,
      type: name,
    }
  })

  info.props = _.sortBy(info.props, 'name')

  return info
}

export default getComponentInfo

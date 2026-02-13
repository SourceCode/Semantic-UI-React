import _ from 'lodash'
import { utils as docgenUtils } from 'react-docgen'

function getObjectName(path) {
  return [path.node.object.name, path.node.property.name].join('.')
}

const getArgumentValue = (path) => {
  if (path.isIdentifier()) {
    return path.node.name
  }

  if (path.isMemberExpression()) {
    return getObjectName(path)
  }

  throw new Error('Unsupported value')
}

const isMeanableMember = (path) => {
  if (path.isCallExpression()) {
    const callee = path.get('callee')
    const typeName = getObjectName(callee)

    return typeName.startsWith('PropTypes')
  }

  return path.isMemberExpression()
}

const amendPropTypes = (documentation, path) => {
  if (!path.isObjectExpression()) {
    return
  }

  path.get('properties').forEach((propertyPath) => {
    const propertyName = docgenUtils.getPropertyName(propertyPath)
    const propDescriptor = documentation.getPropDescriptor(propertyName)
    const valuePath = propertyPath.get('value')

    if (!valuePath.isCallExpression()) {
      return
    }

    const argumentPath = valuePath.get('arguments.0')
    const calleePath = valuePath.get('callee')

    if (!calleePath.isMemberExpression()) {
      return
    }

    const objectName = getObjectName(calleePath)

    if (objectName === 'customPropTypes.onlyProp' || objectName === 'customPropTypes.suggest') {
      propDescriptor.type = {
        name: 'enum',
        value: getArgumentValue(argumentPath),
      }

      return
    }

    if (objectName === 'customPropTypes.every') {
      const elements = valuePath.get('arguments')
      const parsedTypes = []

      for (let i = 0; i < elements.length; i += 1) {
        const element = elements[i]

        if (isMeanableMember(element)) {
          parsedTypes.push(docgenUtils.getPropType(element))
        }
      }

      propDescriptor.type = {
        name: 'union',
        value: parsedTypes,
      }
    }
  })
}

const parserCustomHandler = (documentation, componentDefinitionPath) => {
  let propTypesPath = docgenUtils.getMemberValuePath(componentDefinitionPath, 'propTypes')

  if (!propTypesPath) {
    return
  }

  propTypesPath = docgenUtils.resolveToValue(propTypesPath)

  if (!propTypesPath) {
    return
  }

  amendPropTypes(documentation, propTypesPath)
}

export default parserCustomHandler

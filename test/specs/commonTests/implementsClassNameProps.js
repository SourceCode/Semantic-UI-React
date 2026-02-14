import React from 'react'
import { render } from '@testing-library/react'
import _ from 'lodash'

import { consoleUtil } from 'test/utils'
import {
  classNamePropValueBeforePropName,
  noClassNameFromBoolProps,
  noDefaultClassNameFromProp,
} from './classNameHelpers'
import helpers from './commonHelpers'

/**
 * Assert that a Component prop's name and value are required to create a className.
 */
export const propKeyAndValueToClassName = (Component, propKey, propValues, options = {}) => {
  const { assertRequired } = helpers('propKeyAndValueToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    classNamePropValueBeforePropName(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)
    noClassNameFromBoolProps(Component, propKey, propValues, options)
  })
}

/**
 * Assert that only a Component prop's name is converted to className.
 */
export const propKeyOnlyToClassName = (Component, propKey, options = {}) => {
  const { className = propKey, requiredProps = {} } = options
  const { assertRequired } = helpers('propKeyOnlyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noDefaultClassNameFromProp(Component, propKey, [], options)

    it('adds prop name to className', () => {
      consoleUtil.disableOnce()

      const element = React.createElement(Component, { ...requiredProps, [propKey]: true })
      const { container } = render(element)
      const elementClassName = container.firstChild.className

      expect(elementClassName).toContain(className)
    })

    it('does not add prop value to className', () => {
      consoleUtil.disableOnce()

      const value = 'foo-bar-baz'
      const element = React.createElement(Component, { ...requiredProps, [propKey]: value })
      const { container } = render(element)

      expect(container.firstChild).not.toHaveClass(value)
    })
  })
}

/**
 * Assert that a Component prop name or value convert to a className.
 */
export const propKeyOrValueAndKeyToClassName = (Component, propKey, propValues, options = {}) => {
  const { className = propKey, requiredProps = {} } = options
  const { assertRequired } = helpers('propKeyOrValueAndKeyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noDefaultClassNameFromProp(Component, propKey, propValues, options)
    classNamePropValueBeforePropName(Component, propKey, propValues, options)

    beforeEach(() => {
      consoleUtil.disableOnce()
    })

    it('adds only the name to className when true', () => {
      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: true }),
      )

      expect(container.firstChild).toHaveClass(className)
    })

    it('adds no className when false', () => {
      const { container } = render(
        React.createElement(Component, { ...requiredProps, [propKey]: false }),
      )
      const el = container.firstChild

      expect(el).not.toHaveClass(className)
      expect(el).not.toHaveClass('true')
      expect(el).not.toHaveClass('false')

      _.each(propValues, (propVal) => {
        expect(el).not.toHaveClass(propVal)
      })
    })
  })
}

/**
 * Assert that only a Component prop's value is converted to className.
 */
export const propValueOnlyToClassName = (Component, propKey, propValues, options = {}) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('propValueOnlyToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')
    assertRequired(propKey, 'a `propKey`')

    noClassNameFromBoolProps(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)

    it('adds prop value to className', () => {
      propValues.forEach((propValue) => {
        const { container } = render(
          React.createElement(Component, { ...requiredProps, [propKey]: propValue }),
        )
        expect(container.firstChild).toHaveClass(propValue.toString())
      })
    })

    it('does not add prop name to className', () => {
      consoleUtil.disableOnce()

      propValues.forEach((propValue) => {
        const { container } = render(
          React.createElement(Component, { ...requiredProps, [propKey]: propValue }),
        )
        expect(container.firstChild).not.toHaveClass(propKey)
      })
    })
  })
}

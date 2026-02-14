import { createElement } from 'react'
import { render } from '@testing-library/react'

import Button from 'src/elements/Button'
import Icon from 'src/elements/Icon'
import Image from 'src/elements/Image'
import Label from 'src/elements/Label'
import { numberToWord, SUI } from 'src/lib'
import implementsShorthandProp from './implementsShorthandProp'
import { noClassNameFromBoolProps, noDefaultClassNameFromProp } from './classNameHelpers'
import helpers from './commonHelpers'

/**
 * Assert that a Component correctly implements a Button shorthand prop.
 */
export const implementsButtonProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'button',
    ShorthandComponent: Button,
    mapValueToProps: (val) => ({ content: val }),
    ...options,
  })
}

/**
 * Assert that a Component correctly implements an HTML iframe shorthand prop.
 */
export const implementsHTMLIFrameProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'iframe',
    ShorthandComponent: 'iframe',
    mapValueToProps: (src) => ({ src }),
    ...options,
  })
}

/**
 * Assert that a Component correctly implements an HTML input shorthand prop.
 */
export const implementsHTMLInputProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'input',
    ShorthandComponent: 'input',
    mapValueToProps: (val) => ({ type: val }),
    ...options,
  })
}

/**
 * Assert that a Component correctly implements an HTML label shorthand prop.
 */
export const implementsHTMLLabelProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'label',
    ShorthandComponent: 'label',
    mapValueToProps: (val) => ({ children: val }),
    ...options,
  })
}

/**
 * Assert that a Component correctly implements an Icon shorthand prop.
 */
export const implementsIconProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    assertExactMatch: false,
    propKey: 'icon',
    ShorthandComponent: Icon,
    mapValueToProps: (val) => ({ name: val }),
    ...options,
  })
}

/**
 * Assert that a Component correctly implements an Image shorthand prop.
 */
export const implementsImageProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'image',
    ShorthandComponent: Image,
    mapValueToProps: (val) => ({ src: val }),
    ...options,
  })
}

/**
 * Assert that a Component correctly implements a Label shorthand prop.
 */
export const implementsLabelProp = (Component, options = {}) => {
  implementsShorthandProp(Component, {
    propKey: 'label',
    ShorthandComponent: Label,
    mapValueToProps: (val) => ({ content: val }),
    ...options,
  })
}

/**
 * Assert that a Component correctly implements the "only" prop.
 */
export const implementsMultipleProp = (Component, propKey, propValues) => {
  const { assertRequired } = helpers('propKeyAndValueToClassName', Component)

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')

    noDefaultClassNameFromProp(Component, propKey, propValues)
    noClassNameFromBoolProps(Component, propKey, propValues)

    propValues.forEach((propVal) => {
      it(`adds "${propVal} ${propKey}" to className`, () => {
        const { container } = render(createElement(Component, { [propKey]: propVal }))
        expect(container.firstChild).toHaveClass(`${propVal} ${propKey}`)
      })
    })

    it('adds all possible values to className', () => {
      const className = propValues.map((prop) => `${prop} ${propKey}`).join(' ')
      const propValue = propValues.join(' ')

      const { container } = render(createElement(Component, { [propKey]: propValue }))
      // Check each class individually since toHaveClass checks each class name
      className.split(' ').forEach((cls) => {
        expect(container.firstChild.className).toContain(cls)
      })
    })
  })
}

/**
 * Assert that a Component correctly implements the "textAlign" prop.
 */
export const implementsTextAlignProp = (
  Component,
  alignments = SUI.TEXT_ALIGNMENTS,
  options = {},
) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('implementsTextAlignProp', Component)

  describe('aligned (common)', () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, 'textAlign', alignments, options)
    noDefaultClassNameFromProp(Component, 'textAlign', alignments, options)

    alignments.forEach((propVal) => {
      if (propVal === 'justified') {
        it('adds "justified" without "aligned" to className', () => {
          const { container } = render(
            <Component {...requiredProps} textAlign='justified' />,
          )
          expect(container.firstChild).toHaveClass('justified')
          expect(container.firstChild).not.toHaveClass('aligned')
        })
      } else {
        it(`adds "${propVal} aligned" to className`, () => {
          const { container } = render(
            <Component {...requiredProps} textAlign={propVal} />,
          )
          expect(container.firstChild.className).toContain(`${propVal} aligned`)
        })
      }
    })
  })
}

/**
 * Assert that a Component correctly implements the "verticalAlign" prop.
 */
export const implementsVerticalAlignProp = (
  Component,
  alignments = SUI.VERTICAL_ALIGNMENTS,
  options = {},
) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('implementsVerticalAlignProp', Component)

  describe('verticalAlign (common)', () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, 'verticalAlign', alignments, options)
    noDefaultClassNameFromProp(Component, 'verticalAlign', alignments, options)

    alignments.forEach((propVal) => {
      it(`adds "${propVal} aligned" to className`, () => {
        const { container } = render(
          <Component {...requiredProps} verticalAlign={propVal} />,
        )
        expect(container.firstChild.className).toContain(`${propVal} aligned`)
      })
    })
  })
}

/**
 * Assert that a Component correctly implements a width prop.
 */
export const implementsWidthProp = (Component, widths = SUI.WIDTHS, options = {}) => {
  const { canEqual = true, propKey, requiredProps = {}, widthClass } = options
  const { assertRequired } = helpers('implementsWidthProp', Component)
  const propValues = canEqual ? [...widths, 'equal'] : widths

  describe(`${propKey} (common)`, () => {
    assertRequired(Component, 'a `Component`')

    noClassNameFromBoolProps(Component, propKey, propValues, options)
    noDefaultClassNameFromProp(Component, propKey, propValues, options)

    it('adds numberToWord value to className', () => {
      widths.forEach((width) => {
        const expectClass = widthClass
          ? `${numberToWord(width)} ${widthClass}`
          : numberToWord(width)

        const { container } = render(
          createElement(Component, { ...requiredProps, [propKey]: width }),
        )
        expect(container.firstChild.className).toContain(expectClass)
      })
    })

    if (canEqual) {
      it('adds "equal width" to className', () => {
        const { container } = render(
          createElement(Component, { ...requiredProps, [propKey]: 'equal' }),
        )
        expect(container.firstChild.className).toContain('equal width')
      })
    }
  })
}

/**
 * Assert that a Components with a label correctly implements the "id" and "htmlFor" props.
 */
export const labelImplementsHtmlForProp = (Component, options = {}) => {
  const { requiredProps = {} } = options
  const { assertRequired } = helpers('labelImplementsHtmlForProp', Component)

  describe('htmlFor (common)', () => {
    assertRequired(Component, 'a `Component`')

    it('adds htmlFor to label', () => {
      const id = 'id-for-test'
      const label = 'label-for-test'

      const { container } = render(<Component {...requiredProps} id={id} label={label} />)
      const labelNode = container.querySelector('label')

      expect(container.querySelector(`#${id}`)).toBeInTheDocument()
      expect(labelNode).toHaveAttribute('for', id)
    })
  })
}

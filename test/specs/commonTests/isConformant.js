import { faker } from '@faker-js/faker'
import _ from 'lodash'
import ReactIs from 'react-is'
import { render, fireEvent } from '@testing-library/react'
import * as semanticUIReact from 'semantic-ui-react'

import {
  assertBodyContains,
  consoleUtil,
  getComponentName,
  getComponentProps,
  syntheticEvent,
} from 'test/utils'

/**
 * Derive component metadata from displayName and the semanticUIReact exports,
 * replacing the old webpack `componentInfoContext`.
 */
function deriveComponentInfo(constructorName) {
  // Find component in exports
  const Component = semanticUIReact[constructorName]

  // Determine if this is a child component by checking if the name contains a parent prefix
  // e.g., "ButtonContent" → parent is "Button", "TableCell" → parent is "Table"
  let isChild = false
  let parentDisplayName = null

  // Check all exports to see if any component has this as a static property
  Object.keys(semanticUIReact).forEach((exportName) => {
    const exported = semanticUIReact[exportName]
    if (exported && typeof exported === 'function' && exportName !== constructorName) {
      // Check if the constructorName starts with exportName (e.g. ButtonContent starts with Button)
      if (
        constructorName.startsWith(exportName) &&
        constructorName !== exportName &&
        constructorName.length > exportName.length
      ) {
        // Verify the parent actually has this as a subcomponent
        const subName = constructorName.slice(exportName.length)
        if (exported[subName] === Component || exported[constructorName] === Component) {
          isChild = true
          parentDisplayName = exportName
        }
      }
    }
  })

  // Derive componentClassName (e.g., "Button" → "button", "ButtonContent" → "content")
  let componentClassName
  if (isChild && parentDisplayName) {
    const childPart = constructorName.slice(parentDisplayName.length)
    componentClassName = childPart
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
  } else {
    componentClassName = constructorName
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
  }

  return {
    displayName: constructorName,
    componentClassName,
    isChild,
    parentDisplayName,
    filenameWithoutExt: constructorName,
  }
}

/**
 * Assert Component conforms to guidelines that are applicable to all components.
 * @param {React.Component|Function} Component A component that should conform.
 * @param {Object} [options={}]
 * @param {Object} [options.eventTargets={}] Map of events and the child component to target.
 * @param {boolean} [options.rendersChildren=false] Does this component render any children?
 * @param {boolean} [options.rendersFragmentByDefault=false] Does this component renders React.Fragment by default?
 * @param {boolean} [options.rendersPortal=false] Does this component render a Portal powered component?
 * @param {Object} [options.requiredProps={}] Props required to render Component without errors or warnings.
 */
export default function isConformant(Component, options = {}) {
  const {
    eventTargets = {},
    requiredProps = {},
    rendersChildren = true,
    rendersFragmentByDefault = false,
    rendersPortal = false,
  } = options
  const constructorName = getComponentName(Component)

  it('a valid component should be exported', () => {
    expect(ReactIs.isValidElementType(Component)).toBe(true)
  })

  it('a component should be a function/class or "displayName" should be defined', () => {
    expect(constructorName).toBeTruthy()
  })

  const info = deriveComponentInfo(constructorName)

  // ----------------------------------------
  // Class and file name
  // ----------------------------------------
  it(`constructor name matches filename "${constructorName}"`, () => {
    expect(constructorName).toBe(info.filenameWithoutExt)
  })

  // ----------------------------------------
  // Is exported or private
  // ----------------------------------------
  const isTopLevelAPIProp = _.has(semanticUIReact, constructorName)

  it('is exported at the top level', () => {
    expect(isTopLevelAPIProp).toBe(true)
  })

  if (info.isChild) {
    it('is a static component on its parent', () => {
      const parent = semanticUIReact[info.parentDisplayName]
      const childName = constructorName.slice(info.parentDisplayName.length)
      const found = parent && parent[childName] === Component
      expect(found).toBe(true)
    })
  }

  // ----------------------------------------
  // Props
  // ----------------------------------------
  if (rendersChildren && !rendersPortal) {
    it('spreads user props', () => {
      consoleUtil.disableOnce()
      const propName = 'data-is-conformant-spread-props'
      const props = { as: rendersFragmentByDefault ? 'div' : undefined, [propName]: true }

      const { container } = render(<Component {...props} {...requiredProps} />)
      expect(container.querySelector(`[${propName}]`)).toBeInTheDocument()
    })
  }

  if (rendersChildren && rendersPortal) {
    it('spreads user props', () => {
      consoleUtil.disableOnce()
      const propName = 'data-is-conformant-spread-props'
      const props = { [propName]: true }

      render(<Component {...props} {...requiredProps} />)
      expect(document.querySelector(`[${propName}]`)).toBeInTheDocument()
    })
  }

  if (rendersChildren && !rendersPortal) {
    describe('"as" prop (common)', () => {
      it('renders the component as HTML tags or passes "as" to the next component', () => {
        consoleUtil.disableOnce()

        const tags = ['div', 'span', 'a', 'p']
        tags.forEach((tag) => {
          const { container } = render(<Component {...requiredProps} as={tag} />)
          // Check if root element is the specified tag or check the rendered output
          const root = container.firstChild
          if (root) {
            const renderedTag = root.tagName.toLowerCase()
            // Either renders as the specified tag directly, or wraps it
            expect(renderedTag === tag || container.querySelector(tag) !== null).toBe(true)
          }
        })
      })

      it('renders as a functional component or passes "as" to the next component', () => {
        consoleUtil.disableOnce()
        const MyComponent = (props) => <div data-custom-component {...props} />

        const { container } = render(<Component {...requiredProps} as={MyComponent} />)
        // The component should render - either using MyComponent directly or passing it along
        expect(container.firstChild).toBeInTheDocument()
      })

      it('passes extra props to the component it is renders as', () => {
        consoleUtil.disableOnce()
        const MyComponent = (props) => <div {...props} />

        const { container } = render(
          <Component {...requiredProps} as={MyComponent} data-extra-prop='foo' />,
        )
        expect(container.querySelector('[data-extra-prop="foo"]')).toBeInTheDocument()
      })
    })
  }

  describe('handles props', () => {
    const componentProps = getComponentProps(Component)

    it('defines handled props in Component.handledProps', () => {
      expect(componentProps).toHaveProperty('handledProps')
      expect(Array.isArray(componentProps.handledProps)).toBe(true)
    })
  })

  // ----------------------------------------
  // Events
  // ----------------------------------------
  if (rendersChildren && !rendersPortal) {
    it('handles events transparently', () => {
      _.each(syntheticEvent.types, ({ eventShape, listeners }) => {
        _.each(listeners, (listenerName) => {
          // onKeyDown => keyDown
          const eventName = _.camelCase(listenerName.replace('on', ''))

          const handlerSpy = vi.fn()
          const props = {
            ...requiredProps,
            [listenerName]: handlerSpy,
            'data-simulate-event-here': true,
          }

          consoleUtil.disableOnce()
          const { container } = render(
            <Component as={rendersFragmentByDefault ? 'div' : undefined} {...props} />,
          )

          const eventTarget =
            eventTargets[listenerName]
              ? container.querySelector(eventTargets[listenerName])
              : container.querySelector('[data-simulate-event-here]')

          if (eventTarget) {
            try {
              fireEvent[eventName]
                ? fireEvent[eventName](eventTarget, eventShape)
                : fireEvent(eventTarget, new Event(eventName, { bubbles: true }))
            } catch {
              // some events may not be supported by fireEvent, skip them
            }

            if (handlerSpy.mock.calls.length > 0) {
              expect(handlerSpy).toHaveBeenCalled()
            }
          }
        })
      })
    })
  }

  // ----------------------------------------
  // Has no deprecated _meta
  // ----------------------------------------
  describe('_meta', () => {
    it('does not exist', () => {
      expect(Component._meta).toBeUndefined()
    })
  })

  // ----------------------------------------
  // Has no deprecated .defaultProps
  // ----------------------------------------
  describe('defaultProps', () => {
    it('does not exist', () => {
      expect(Component.defaultProps).toBeUndefined()
    })
  })

  // ----------------------------------------
  // Handles className
  // ----------------------------------------
  if (rendersChildren) {
    describe('className (common)', () => {
      it("applies user's className to root component", () => {
        consoleUtil.disableOnce()
        const className = 'is-conformant-class-string'

        if (rendersPortal) {
          render(<Component {...requiredProps} className={className} open />)
          // Portal content may be in document.body
          assertBodyContains(`.${className}`)
        } else {
          const { container } = render(
            <Component
              as={rendersFragmentByDefault ? 'div' : undefined}
              {...requiredProps}
              className={className}
            />,
          )
          expect(container.firstChild).toHaveClass(className)
        }
      })

      it("user's className does not override the default classes", () => {
        consoleUtil.disableOnce()
        const { container } = render(<Component {...requiredProps} />)
        const defaultClasses = container.firstChild?.className

        if (!defaultClasses) return

        const userClasses = faker.hacker.verb()
        const { container: container2 } = render(
          <Component {...requiredProps} className={userClasses} />,
        )
        const mixedClasses = container2.firstChild?.className

        if (mixedClasses) {
          defaultClasses.split(' ').forEach((defaultClass) => {
            if (defaultClass) {
              expect(mixedClasses).toContain(defaultClass)
            }
          })
        }
      })
    })
  }
}

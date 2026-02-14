import { faker } from '@faker-js/faker'
import { createElement } from 'react'
import { render } from '@testing-library/react'

import helpers from './commonHelpers'

/**
 * Assert a component renders children somewhere in the tree.
 * @param {React.Component|Function} Component A component that should render children.
 * @param {Object} [options={}]
 * @param {Object} [options.rendersContent] Assert that component also renders `content` prop.
 * @param {Object} [options.requiredProps={}] Props required to render the component.
 */
export default (Component, options = {}) => {
  const { rendersContent = true, requiredProps = {} } = options
  const { assertRequired } = helpers('rendersChildren', Component)

  assertRequired(Component, 'a `Component`')

  describe('children (common)', () => {
    it('renders child text', () => {
      const text = faker.hacker.phrase()
      const { getByText } = render(createElement(Component, requiredProps, text))
      expect(getByText(text)).toBeInTheDocument()
    })

    it('renders child components', () => {
      const testId = faker.hacker.noun()
      const child = <div data-testid={testId} />
      const { getByTestId } = render(createElement(Component, requiredProps, child))
      expect(getByTestId(testId)).toBeInTheDocument()
    })

    it('renders child number with 0 value', () => {
      const { container } = render(createElement(Component, requiredProps, 0))
      expect(container.textContent).toContain('0')
    })
  })

  if (rendersContent) {
    describe('content (common)', () => {
      it('renders child text', () => {
        const text = faker.hacker.phrase()
        const { getByText } = render(createElement(Component, { ...requiredProps, content: text }))
        expect(getByText(text)).toBeInTheDocument()
      })

      it('renders child components', () => {
        const testId = faker.hacker.noun()
        const child = <div data-testid={testId} />
        const { getByTestId } = render(
          createElement(Component, { ...requiredProps, content: child }),
        )
        expect(getByTestId(testId)).toBeInTheDocument()
      })

      it('renders child number with 0 value', () => {
        const { container } = render(
          createElement(Component, { ...requiredProps, content: 0 }),
        )
        expect(container.textContent).toContain('0')
      })
    })
  }
}

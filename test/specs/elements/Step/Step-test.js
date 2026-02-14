import { faker } from '@faker-js/faker'
import { render, fireEvent } from '@testing-library/react'

import Step from 'src/elements/Step/Step'
import StepContent from 'src/elements/Step/StepContent'
import StepDescription from 'src/elements/Step/StepDescription'
import StepTitle from 'src/elements/Step/StepTitle'
import * as common from 'test/specs/commonTests'

describe('Step', () => {
  common.isConformant(Step)
  common.hasSubcomponents(Step, [StepContent, StepDescription, StepTitle])
  common.rendersChildren(Step)

  common.implementsIconProp(Step, { autoGenerateKey: false })

  common.propKeyOnlyToClassName(Step, 'active')
  common.propKeyOnlyToClassName(Step, 'completed')
  common.propKeyOnlyToClassName(Step, 'disabled')
  common.propKeyOnlyToClassName(Step, 'link')

  it('renders as a div by default', () => {
    const { container } = render(<Step />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  describe('children', () => {
    it('does not render StepContent with children', () => {
      const { container } = render(<Step>{faker.hacker.phrase()}</Step>)
      expect(container.querySelector('.content')).toBeNull()
    })
  })

  describe('description', () => {
    it('passes prop to StepContent', () => {
      const description = faker.hacker.phrase()
      const { container } = render(<Step description={description} />)
      const content = container.querySelector('.content')
      expect(content).toBeTruthy()
      expect(content.querySelector('.description')).toHaveTextContent(description)
    })
  })

  describe('href', () => {
    it('renders as `a` when defined', () => {
      const url = faker.internet.url()
      const { container } = render(<Step href={url} />)

      expect(container.firstChild.tagName).toBe('A')
      expect(container.firstChild).toHaveAttribute('href', url)
    })
  })

  describe('onClick', () => {
    it('is called with (e, data) when clicked', () => {
      const onClick = vi.fn()

      const { container } = render(<Step onClick={onClick} />)

      fireEvent.click(container.firstChild)

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ onClick }),
      )
    })

    it('is not called when is disabled', () => {
      const onClick = vi.fn()

      const { container } = render(<Step disabled onClick={onClick} />)

      fireEvent.click(container.firstChild)
      expect(onClick).not.toHaveBeenCalled()
    })

    it('renders as `a` when defined', () => {
      const { container } = render(<Step onClick={() => null} />)
      expect(container.firstChild.tagName).toBe('A')
    })
  })

  describe('title', () => {
    it('passes prop to StepContent', () => {
      const title = faker.hacker.phrase()
      const { container } = render(<Step title={title} />)
      const content = container.querySelector('.content')
      expect(content).toBeTruthy()
      expect(content.querySelector('.title')).toHaveTextContent(title)
    })
  })
})

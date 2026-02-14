import _ from 'lodash'
import { render } from '@testing-library/react'

import { SUI } from 'src/lib'
import Progress from 'src/modules/Progress/Progress'
import * as common from 'test/specs/commonTests'

describe('Progress', () => {
  common.isConformant(Progress)
  common.hasUIClassName(Progress)
  common.rendersChildren(Progress)

  common.propKeyAndValueToClassName(Progress, 'attached', ['top', 'bottom'])

  common.propKeyOnlyToClassName(Progress, 'active')
  common.propKeyOnlyToClassName(Progress, 'disabled')
  common.propKeyOnlyToClassName(Progress, 'error')
  common.propKeyOnlyToClassName(Progress, 'indicating')
  common.propKeyOnlyToClassName(Progress, 'inverted')
  common.propKeyOnlyToClassName(Progress, 'success')
  common.propKeyOnlyToClassName(Progress, 'warning')

  common.propValueOnlyToClassName(Progress, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(Progress, 'size', _.without(SUI.SIZES, 'mini', 'huge', 'massive'))

  it('contains div with className bar', () => {
    const { container } = render(<Progress />)
    const bar = container.querySelector('.bar')

    expect(bar).toBeInTheDocument()
    expect(bar.tagName).toBe('DIV')
  })

  describe('attached', () => {
    it('removes the progress label from the bar', () => {
      const { container } = render(<Progress attached='top' />)
      expect(container.querySelector('.bar .progress')).not.toBeInTheDocument()
    })
  })

  describe('autoSuccess', () => {
    it('applies the success class when percent >= 100%', () => {
      const { container, rerender } = render(<Progress autoSuccess />)

      rerender(<Progress percent={100} autoSuccess />)
      expect(container.firstChild).toHaveClass('success')

      rerender(<Progress percent={99} autoSuccess />)
      expect(container.firstChild).not.toHaveClass('success')

      rerender(<Progress percent={101} autoSuccess />)
      expect(container.firstChild).toHaveClass('success')
    })
    it('applies the success class when value >= total', () => {
      const { container, rerender } = render(<Progress autoSuccess />)

      rerender(<Progress total={1} value={1} autoSuccess />)
      expect(container.firstChild).toHaveClass('success')

      rerender(<Progress total={1} value={0} autoSuccess />)
      expect(container.firstChild).not.toHaveClass('success')

      rerender(<Progress total={1} value={2} autoSuccess />)
      expect(container.firstChild).toHaveClass('success')
    })
  })

  describe('bar', () => {
    it('has a width equal to the percent complete', () => {
      const { container } = render(<Progress percent={33.333} />)
      expect(container.querySelector('.bar').style.width).toBe('33.333%')
    })
    it('cannot have its width set >100%', () => {
      const { container } = render(<Progress percent={101} />)
      expect(container.querySelector('.bar').style.width).toBe('100%')
    })
    it('cannot have its width set <0%', () => {
      const { container } = render(<Progress percent={-1} />)
      expect(container.querySelector('.bar').style.width).toBe('0%')
    })
    it('has a width equal to the percentage of the value of the total, when progress="value"', () => {
      const { container } = render(<Progress progress='value' value={5} total={10} />)
      expect(container.querySelector('.bar').style.width).toBe('50%')
    })
  })

  describe('data-percent', () => {
    it('adds prop by default', () => {
      const { container } = render(<Progress />)
      expect(container.firstChild).toHaveAttribute('data-percent')
    })

    it('passes value of percent prop', () => {
      const { container } = render(<Progress percent={10} />)
      expect(container.firstChild).toHaveAttribute('data-percent', '10')
    })

    it('floors the value of percent prop', () => {
      const { container } = render(<Progress percent={8.28} />)
      expect(container.firstChild).toHaveAttribute('data-percent', '8')
    })

    it('floors the results value and total props', () => {
      const { container } = render(<Progress value={828} total={10000} />)
      expect(container.firstChild).toHaveAttribute('data-percent', '8')
    })
  })

  describe('indicating', () => {
    it('adds the "active" class', () => {
      const { container } = render(<Progress indicating />)
      expect(container.firstChild).toHaveClass('active')
    })
  })

  describe('label', () => {
    it('shows the label text when provided', () => {
      const { container } = render(<Progress label='some-label' />)
      expect(container.querySelector('.label').textContent).toContain('some-label')
    })
  })

  describe('progress', () => {
    it('hides the progress text by default', () => {
      const { container } = render(<Progress />)
      expect(container.querySelector('.bar .progress')).not.toBeInTheDocument()
    })
    it('shows the progress text when true', () => {
      const { container } = render(<Progress progress />)
      expect(container.querySelector('.bar .progress')).toBeInTheDocument()
    })
    it('hides the progress text when false', () => {
      const { container } = render(<Progress progress={false} />)
      expect(container.querySelector('.bar .progress')).not.toBeInTheDocument()
    })
    it('displays the progress as a percentage by default', () => {
      const { container } = render(<Progress percent={20} progress />)
      expect(container.querySelector('.progress').textContent).toContain('20%')
    })
    it('displays the progress as a ratio when set to "ratio"', () => {
      const { container } = render(<Progress progress='ratio' value={1} total={2} />)
      expect(container.querySelector('.progress').textContent).toContain('1/2')
    })
    it('displays the progress as a percentage when set to "percent"', () => {
      const { container } = render(<Progress progress='percent' value={1} total={2} />)
      expect(container.querySelector('.progress').textContent).toContain('50%')
    })
    it('displays the progress as text when set to "value"', () => {
      const { container } = render(<Progress progress='value' value={1} total={2} />)
      expect(container.querySelector('.progress').textContent).toContain('1')
    })
    it('shows the percent complete', () => {
      const { container } = render(<Progress percent={72} progress />)
      expect(container.querySelector('.progress').textContent).toContain('72%')
    })
    it('cannot be set >100%', () => {
      const { container } = render(<Progress percent={101} progress />)
      expect(container.querySelector('.progress').textContent).toContain('100%')
    })
    it('cannot be set <0%', () => {
      const { container } = render(<Progress percent={-1} progress />)
      expect(container.querySelector('.progress').textContent).toContain('0%')
    })
    it('displays values with a decimal', () => {
      const { container } = render(<Progress percent={10.12345} progress />)
      expect(container.querySelector('.progress').textContent).toContain('10.12345%')
    })
    it('displays values without a decimal', () => {
      const { container } = render(<Progress percent={35} progress />)
      expect(container.querySelector('.progress').textContent).toContain('35%')
    })
  })

  describe('precision', () => {
    it('rounds the progress label to 0 decimal places by default', () => {
      const { container } = render(<Progress percent={10.12345} precision={0} />)
      expect(container.querySelector('.progress').textContent).toContain('10%')
    })
    it('removes the decimal from progress label when set to 0', () => {
      const { container } = render(<Progress percent={10.12345} precision={0} />)
      expect(container.querySelector('.progress').textContent).toContain('10%')
    })
    it('rounds the decimal in the progress label to the number of digits', () => {
      const { container: c1 } = render(<Progress percent={10.12345} precision={1} />)
      expect(c1.querySelector('.progress').textContent).toContain('10.1%')

      const { container: c2 } = render(<Progress percent={10.12345} precision={4} />)
      expect(c2.querySelector('.progress').textContent).toContain('10.1235%')
    })
  })

  describe('total/value', () => {
    it('calculates the percent complete', () => {
      const { container } = render(<Progress value={1} total={2} progress />)
      expect(container.querySelector('.progress').textContent).toContain('50%')
    })
  })
})

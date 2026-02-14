import { render } from '@testing-library/react'

import Breadcrumb from 'src/collections/Breadcrumb/Breadcrumb'
import BreadcrumbDivider from 'src/collections/Breadcrumb/BreadcrumbDivider'
import BreadcrumbSection from 'src/collections/Breadcrumb/BreadcrumbSection'
import * as common from 'test/specs/commonTests'

describe('Breadcrumb', () => {
  common.isConformant(Breadcrumb)
  common.hasSubcomponents(Breadcrumb, [BreadcrumbDivider, BreadcrumbSection])
  common.hasUIClassName(Breadcrumb)
  common.rendersChildren(Breadcrumb, {
    rendersContent: false,
  })

  it('renders a <div /> element', () => {
    const { container } = render(<Breadcrumb />)
    expect(container.firstChild.tagName).toBe('DIV')
  })

  const sections = [
    { key: 'home', content: 'Home', link: true },
    { key: 't-shirt', content: 'T-Shirt', href: 'example.com' },
  ]

  it('renders children with `sections` prop', () => {
    const { container } = render(<Breadcrumb sections={sections} />)

    expect(container.querySelectorAll('.divider')).toHaveLength(1)
    expect(container.querySelectorAll('.section')).toHaveLength(2)
  })

  it('renders defined divider with `divider` prop', () => {
    const { container } = render(<Breadcrumb sections={sections} divider='>' />)
    const divider = container.querySelector('.divider')

    expect(divider).toHaveTextContent('>')
  })
})

import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getUnhandledProps,
  getComponentType,
  getKeyOnly,
  useEventCallback,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictBreadcrumbSectionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Style as the currently active section. */
  active?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Render as an `a` tag instead of a `div` and adds the href attribute. */
  href?: string
  /** Render as an `a` tag instead of a `div`. */
  link?: boolean
  /**
   * Called on click. When passed, the component will render as an `a`
   * tag by default instead of a `div`.
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: BreadcrumbSectionProps) => void
}

export interface BreadcrumbSectionProps extends StrictBreadcrumbSectionProps {
  [key: string]: any
}

/**
 * A section sub-component for Breadcrumb component.
 */
function BreadcrumbSection({ ref, ...props }: BreadcrumbSectionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, children, className, content, href, link, onClick } = props

  const classes = cx(getKeyOnly(active, 'active'), 'section', className)
  const rest = getUnhandledProps(BreadcrumbSection, props)
  const ElementType = getComponentType(props, {
    getDefault: () => {
      if (link || onClick) return 'a'
      return undefined
    },
  })

  const handleClick = useEventCallback((e: React.MouseEvent<HTMLAnchorElement>) =>
    _.invoke(props, 'onClick', e, props),
  )

  return (
    <ElementType {...rest} className={classes} href={href} onClick={handleClick} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

BreadcrumbSection.displayName = 'BreadcrumbSection'
BreadcrumbSection.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
  'href',
  'link',
  'onClick',
]

BreadcrumbSection.create = createShorthandFactory(BreadcrumbSection, (content) => ({
  content,
  link: true,
}))

export default BreadcrumbSection

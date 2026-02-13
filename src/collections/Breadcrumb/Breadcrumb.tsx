import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import { childrenUtils, getUnhandledProps, getComponentType } from '../../lib'
import type {
  SemanticShorthandCollection,
  SemanticShorthandContent,
  SemanticShorthandItem,
} from '../../generic'
import type { IconProps } from '../../elements/Icon'
import type { BreadcrumbSectionProps } from './BreadcrumbSection'
import BreadcrumbDivider from './BreadcrumbDivider'
import BreadcrumbSection from './BreadcrumbSection'

export interface StrictBreadcrumbProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content of the Breadcrumb.Divider. */
  divider?: SemanticShorthandContent
  /** For use with the sections prop. Render as an `Icon` component with `divider` class instead of a `div` in Breadcrumb.Divider. */
  icon?: SemanticShorthandItem<IconProps>
  /** Shorthand array of props for Breadcrumb.Section. */
  sections?: SemanticShorthandCollection<BreadcrumbSectionProps>
  /** Size of Breadcrumb. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'
}

export interface BreadcrumbProps extends StrictBreadcrumbProps {
  [key: string]: any
}

/**
 * A breadcrumb is used to show hierarchy between content.
 */
function Breadcrumb({ ref, ...props }: BreadcrumbProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, divider, icon, sections, size } = props

  const classes = cx('ui', size, 'breadcrumb', className)
  const rest = getUnhandledProps(Breadcrumb, props)
  const ElementType = getComponentType(props)

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {children}
      </ElementType>
    )
  }

  const childElements: React.ReactNode[] = []

  _.each(sections, (section, index) => {
    // section
    const breadcrumbElement = BreadcrumbSection.create(section)
    childElements.push(breadcrumbElement)

    // divider
    if (index !== (sections as any[]).length - 1) {
      const key = breadcrumbElement?.key != null
        ? `${breadcrumbElement.key}_divider`
        : JSON.stringify(section)
      childElements.push(BreadcrumbDivider.create({ content: divider, icon, key }))
    }
  })

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childElements}
    </ElementType>
  )
}

Breadcrumb.displayName = 'Breadcrumb'
Breadcrumb.handledProps = [
  'as',
  'children',
  'className',
  'divider',
  'icon',
  'sections',
  'size',
]

Breadcrumb.Divider = BreadcrumbDivider
Breadcrumb.Section = BreadcrumbSection

export default Breadcrumb

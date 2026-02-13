import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getUnhandledProps,
  getComponentType,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictBreadcrumbDividerProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Render as an `Icon` component with `divider` class instead of a `div`. */
  icon?: SemanticShorthandItem<IconProps>
}

export interface BreadcrumbDividerProps extends StrictBreadcrumbDividerProps {
  [key: string]: any
}

/**
 * A divider sub-component for Breadcrumb component.
 */
function BreadcrumbDivider({ ref, ...props }: BreadcrumbDividerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, icon } = props

  const classes = cx('divider', className)
  const rest = getUnhandledProps(BreadcrumbDivider, props)
  const ElementType = getComponentType(props)

  if (!_.isNil(icon)) {
    return Icon.create(icon, {
      defaultProps: { ...rest, className: classes },
      autoGenerateKey: false,
      ref,
    })
  }

  if (!_.isNil(content)) {
    return (
      <ElementType {...rest} className={classes} ref={ref}>
        {content}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? '/' : children}
    </ElementType>
  )
}

BreadcrumbDivider.displayName = 'BreadcrumbDivider'
BreadcrumbDivider.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'icon',
]

BreadcrumbDivider.create = createShorthandFactory(BreadcrumbDivider, (icon) => ({ icon }))

export default BreadcrumbDivider

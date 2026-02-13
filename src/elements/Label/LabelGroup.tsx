import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticCOLORS, SemanticShorthandContent, SemanticSIZES } from '../../generic'

export interface StrictLabelGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Labels can share shapes. */
  circular?: boolean
  /** Additional classes. */
  className?: string
  /** Label group can share colors together. */
  color?: SemanticCOLORS
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Label group can share sizes together. */
  size?: SemanticSIZES
  /** Label group can share tag formatting. */
  tag?: boolean
}

export interface LabelGroupProps extends StrictLabelGroupProps {
  [key: string]: any
}

/**
 * A label can be grouped.
 */
function LabelGroup({ ref, ...props }: LabelGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, circular, className, color, content, size, tag } = props

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(circular, 'circular'),
    getKeyOnly(tag, 'tag'),
    'labels',
    className,
  )
  const rest = getUnhandledProps(LabelGroup, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

LabelGroup.displayName = 'LabelGroup'
LabelGroup.handledProps = [
  'as',
  'children',
  'circular',
  'className',
  'color',
  'content',
  'size',
  'tag',
]

export default LabelGroup

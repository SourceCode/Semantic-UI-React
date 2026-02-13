import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictLabelDetailProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface LabelDetailProps extends StrictLabelDetailProps {
  [key: string]: any
}

function LabelDetail({ ref, ...props }: LabelDetailProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props

  const classes = cx('detail', className)
  const rest = getUnhandledProps(LabelDetail, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

LabelDetail.displayName = 'LabelDetail'
LabelDetail.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

LabelDetail.create = createShorthandFactory(LabelDetail, (val) => ({ content: val }))

export default LabelDetail

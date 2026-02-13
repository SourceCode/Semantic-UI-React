import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictModalHeaderProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
}

export interface ModalHeaderProps extends StrictModalHeaderProps {
  [key: string]: any
}

/**
 * A modal can have a header.
 */
function ModalHeader({ ref, ...props }: ModalHeaderProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content } = props
  const classes = cx('header', className)
  const rest = getUnhandledProps(ModalHeader, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ModalHeader.displayName = 'ModalHeader'
ModalHeader.handledProps = [
  'as',
  'children',
  'className',
  'content',
]

ModalHeader.create = createShorthandFactory(ModalHeader, (content) => ({ content }))

export default ModalHeader

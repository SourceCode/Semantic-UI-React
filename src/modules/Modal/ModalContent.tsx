import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictModalContentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A modal can contain image content. */
  image?: boolean

  /** A modal can use the entire size of the screen. */
  scrolling?: boolean
}

export interface ModalContentProps extends StrictModalContentProps {
  [key: string]: any
}

/**
 * A modal can contain content.
 */
function ModalContent({ ref, ...props }: ModalContentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { children, className, content, image, scrolling } = props

  const classes = cx(
    className,
    getKeyOnly(image, 'image'),
    getKeyOnly(scrolling, 'scrolling'),
    'content',
  )
  const rest = getUnhandledProps(ModalContent, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ModalContent.displayName = 'ModalContent'
ModalContent.handledProps = [
  'as',
  'children',
  'className',
  'content',
  'image',
  'scrolling',
]

ModalContent.create = createShorthandFactory(ModalContent, (content) => ({ content }))

export default ModalContent

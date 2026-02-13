import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  useClassNamesOnNode,
  getKeyOnly,
  useMergedRefs,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictModalDimmerProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A dimmer can be blurred. */
  blurring?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A dimmer can center its contents in the viewport. */
  centered?: boolean

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A dimmer can be inverted. */
  inverted?: boolean

  /** The node where the modal should mount. Defaults to document.body. */
  mountNode?: any

  /** A dimmer can make body scrollable. */
  scrolling?: boolean
}

export interface ModalDimmerProps extends StrictModalDimmerProps {
  [key: string]: any
}

/**
 * A modal has a dimmer.
 */
function ModalDimmer({ ref, ...props }: ModalDimmerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { blurring, children, className, centered, content, inverted, mountNode, scrolling } = props
  const elementRef = useMergedRefs(ref, React.useRef<HTMLDivElement>(null))

  const classes = cx(
    'ui',
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(!centered, 'top aligned'),
    'page modals dimmer transition visible active',
    className,
  )
  const bodyClasses = cx(
    'dimmable dimmed',
    getKeyOnly(blurring, 'blurring'),
    getKeyOnly(scrolling, 'scrolling'),
  )

  const rest = getUnhandledProps(ModalDimmer, props)
  const ElementType = getComponentType(props)

  useClassNamesOnNode(mountNode, bodyClasses)

  React.useEffect(() => {
    elementRef.current?.style?.setProperty('display', 'flex', 'important')
  }, [])

  return (
    <ElementType {...rest} className={classes} ref={elementRef}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

ModalDimmer.displayName = 'ModalDimmer'
ModalDimmer.handledProps = [
  'as',
  'blurring',
  'children',
  'className',
  'centered',
  'content',
  'inverted',
  'mountNode',
  'scrolling',
]

ModalDimmer.create = createShorthandFactory(ModalDimmer, (content) => ({ content }))

export default ModalDimmer

import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  doesNodeContainClick,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getVerticalAlignProp,
  useIsomorphicLayoutEffect,
  useMergedRefs,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictDimmerInnerProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** An active dimmer will dim its parent container. */
  active?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A disabled dimmer cannot be activated */
  disabled?: boolean

  /**
   * Called when the dimmer is clicked.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: DimmerInnerProps) => void

  /**
   * Handles click outside Dimmer's content, but inside Dimmer area.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClickOutside?: (event: React.MouseEvent<HTMLDivElement>, data: DimmerInnerProps) => void

  /** A dimmer can be formatted to have its colors inverted. */
  inverted?: boolean

  /** A dimmer can be formatted to be fixed to the page. */
  page?: boolean

  /** A dimmer can be controlled with simple prop. */
  simple?: boolean

  /** A dimmer can have its content top or bottom aligned. */
  verticalAlign?: 'bottom' | 'top'
}

export interface DimmerInnerProps extends StrictDimmerInnerProps {
  [key: string]: any
}

/**
 * An inner element for a Dimmer.
 */
function DimmerInner({ ref, ...props }: DimmerInnerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active,
    children,
    className,
    content,
    disabled,
    inverted,
    page,
    simple,
    verticalAlign,
  } = props

  const containerRef = useMergedRefs(ref, React.useRef<HTMLDivElement>(null))
  const contentRef = React.useRef<HTMLDivElement>(null)

  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current?.style) {
      return
    }

    if (active) {
      containerRef.current.style.setProperty('display', 'flex', 'important')
    } else {
      containerRef.current.style.removeProperty('display')
    }
  }, [active])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    _.invoke(props, 'onClick', e, props)

    if (contentRef.current !== e.target && doesNodeContainClick(contentRef.current, e)) {
      return
    }

    _.invoke(props, 'onClickOutside', e, props)
  }

  const classes = cx(
    'ui',
    getKeyOnly(active, 'active transition visible'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(page, 'page'),
    getKeyOnly(simple, 'simple'),
    getVerticalAlignProp(verticalAlign),
    'dimmer',
    className,
  )
  const rest = getUnhandledProps(DimmerInner, props)
  const ElementType = getComponentType(props)

  const childrenContent = childrenUtils.isNil(children) ? content : children

  return (
    <ElementType {...rest} className={classes} onClick={handleClick} ref={containerRef}>
      {childrenContent && (
        <div className='content' ref={contentRef}>
          {childrenContent}
        </div>
      )}
    </ElementType>
  )
}

DimmerInner.displayName = 'DimmerInner'
DimmerInner.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'content',
  'disabled',
  'onClick',
  'onClickOutside',
  'inverted',
  'page',
  'simple',
  'verticalAlign',
]

export default DimmerInner

import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
} from '../../lib'
import type { SemanticShorthandContent } from '../../generic'

export interface StrictAdvertisementProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Center the advertisement. */
  centered?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Text to be displayed on the advertisement. */
  test?: boolean | string | number

  /** Varies the size of the advertisement. */
  unit:
    | 'medium rectangle'
    | 'large rectangle'
    | 'vertical rectangle'
    | 'small rectangle'
    | 'mobile banner'
    | 'banner'
    | 'vertical banner'
    | 'top banner'
    | 'half banner'
    | 'button'
    | 'square button'
    | 'small button'
    | 'skyscraper'
    | 'wide skyscraper'
    | 'leaderboard'
    | 'large leaderboard'
    | 'mobile leaderboard'
    | 'billboard'
    | 'panorama'
    | 'netboard'
    | 'half page'
    | 'square'
    | 'small square'
}

export interface AdvertisementProps extends StrictAdvertisementProps {
  [key: string]: any
}

/**
 * An ad displays third-party promotional content.
 */
function Advertisement({ ref, ...props }: AdvertisementProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { centered, children, className, content, test, unit } = props

  const classes = cx(
    'ui',
    unit,
    getKeyOnly(centered, 'centered'),
    getKeyOnly(test, 'test'),
    'ad',
    className,
  )
  const rest = getUnhandledProps(Advertisement, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} data-text={test} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

Advertisement.displayName = 'Advertisement'
Advertisement.handledProps = [
  'as',
  'centered',
  'children',
  'className',
  'content',
  'test',
  'unit',
]

export default Advertisement

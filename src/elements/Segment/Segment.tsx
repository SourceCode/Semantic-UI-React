import cx from 'clsx'
import * as React from 'react'

import {
  childrenUtils,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
  getTextAlignProp,
  getValueAndKey,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticShorthandContent,
  SemanticTEXTALIGNMENTS,
} from '../../generic'
import SegmentGroup from './SegmentGroup'
import SegmentInline from './SegmentInline'

export type SegmentSizeProp = 'mini' | 'tiny' | 'small' | 'large' | 'big' | 'huge' | 'massive'

export interface StrictSegmentProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** Attach segment to other content, like a header. */
  attached?: boolean | 'top' | 'bottom'
  /** A basic segment has no special formatting. */
  basic?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** A segment can be circular. */
  circular?: boolean
  /** Additional classes. */
  className?: string
  /** A segment can clear floated content. */
  clearing?: boolean
  /** Segment can be colored. */
  color?: SemanticCOLORS
  /** A segment may take up only as much space as is necessary. */
  compact?: boolean
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** A segment may show its content is disabled. */
  disabled?: boolean
  /** Segment content can be floated to the left or right. */
  floated?: SemanticFLOATS
  /** A segment can have its colors inverted for contrast. */
  inverted?: boolean
  /** A segment may show its content is being loaded. */
  loading?: boolean
  /** A segment can increase its padding. */
  padded?: boolean | 'very'
  /** A segment can be used to reserve space for conditionally displayed content. */
  placeholder?: boolean
  /** Formatted to look like a pile of pages. */
  piled?: boolean
  /** A segment may be formatted to raise above the page. */
  raised?: boolean
  /** A segment can be formatted to appear less noticeable. */
  secondary?: boolean
  /** A segment can have different sizes. */
  size?: SegmentSizeProp
  /** Formatted to show it contains multiple pages. */
  stacked?: boolean
  /** A segment can be formatted to appear even less noticeable. */
  tertiary?: boolean
  /** Formats content to be aligned as part of a vertical group. */
  textAlign?: SemanticTEXTALIGNMENTS
  /** Formats content to be aligned vertically. */
  vertical?: boolean
}

export interface SegmentProps extends StrictSegmentProps {
  [key: string]: any
}

/**
 * A segment is used to create a grouping of related content.
 */
function Segment({ ref, ...props }: SegmentProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    attached,
    basic,
    children,
    circular,
    className,
    clearing,
    color,
    compact,
    content,
    disabled,
    floated,
    inverted,
    loading,
    placeholder,
    padded,
    piled,
    raised,
    secondary,
    size,
    stacked,
    tertiary,
    textAlign,
    vertical,
  } = props

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(basic, 'basic'),
    getKeyOnly(circular, 'circular'),
    getKeyOnly(clearing, 'clearing'),
    getKeyOnly(compact, 'compact'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(loading, 'loading'),
    getKeyOnly(placeholder, 'placeholder'),
    getKeyOnly(piled, 'piled'),
    getKeyOnly(raised, 'raised'),
    getKeyOnly(secondary, 'secondary'),
    getKeyOnly(stacked, 'stacked'),
    getKeyOnly(tertiary, 'tertiary'),
    getKeyOnly(vertical, 'vertical'),
    getKeyOrValueAndKey(attached, 'attached'),
    getKeyOrValueAndKey(padded, 'padded'),
    getTextAlignProp(textAlign),
    getValueAndKey(floated, 'floated'),
    'segment',
    className,
  )
  const rest = getUnhandledProps(Segment, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

Segment.Group = SegmentGroup
Segment.Inline = SegmentInline

Segment.displayName = 'Segment'
Segment.handledProps = [
  'as',
  'attached',
  'basic',
  'children',
  'circular',
  'className',
  'clearing',
  'color',
  'compact',
  'content',
  'disabled',
  'floated',
  'inverted',
  'loading',
  'padded',
  'placeholder',
  'piled',
  'raised',
  'secondary',
  'size',
  'stacked',
  'tertiary',
  'textAlign',
  'vertical',
]

export default Segment

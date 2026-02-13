import cx from 'clsx'
import * as React from 'react'

import {
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getMultipleProp,
  getTextAlignProp,
  getValueAndKey,
  getVerticalAlignProp,
  getWidthProp,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticFLOATS,
  SemanticTEXTALIGNMENTS,
  SemanticVERTICALALIGNMENTS,
  SemanticWIDTHS,
} from '../../generic'

export type GridOnlyProp =
  | string
  | 'computer'
  | 'largeScreen'
  | 'mobile'
  | 'tablet mobile'
  | 'tablet'
  | 'widescreen'

export interface StrictGridColumnProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A grid column can be colored. */
  color?: SemanticCOLORS

  /** A column can specify a width for a computer. */
  computer?: SemanticWIDTHS

  /** A column can sit flush against the left or right edge of a row. */
  floated?: SemanticFLOATS

  /** A column can specify a width for a large screen device. */
  largeScreen?: SemanticWIDTHS

  /** A column can specify a width for a mobile device. */
  mobile?: SemanticWIDTHS

  /** A column can appear only for a specific device, or screen sizes. */
  only?: GridOnlyProp

  /** A column can stretch its contents to take up the entire grid or row height. */
  stretched?: boolean

  /** A column can specify a width for a tablet device. */
  tablet?: SemanticWIDTHS

  /** A column can specify its text alignment. */
  textAlign?: SemanticTEXTALIGNMENTS

  /** A column can specify its vertical alignment to have all its columns vertically centered. */
  verticalAlign?: SemanticVERTICALALIGNMENTS

  /** A column can specify a width for a wide screen device. */
  widescreen?: SemanticWIDTHS

  /** Represents width of column. */
  width?: SemanticWIDTHS
}

export interface GridColumnProps extends StrictGridColumnProps {
  [key: string]: any
}

/**
 * A column sub-component for Grid.
 */
function GridColumn({ ref, ...props }: GridColumnProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    children,
    className,
    computer,
    color,
    floated,
    largeScreen,
    mobile,
    only,
    stretched,
    tablet,
    textAlign,
    verticalAlign,
    widescreen,
    width,
  } = props

  const classes = cx(
    color,
    getKeyOnly(stretched, 'stretched'),
    getMultipleProp(only, 'only'),
    getTextAlignProp(textAlign),
    getValueAndKey(floated, 'floated'),
    getVerticalAlignProp(verticalAlign),
    getWidthProp(computer, 'wide computer'),
    getWidthProp(largeScreen, 'wide large screen'),
    getWidthProp(mobile, 'wide mobile'),
    getWidthProp(tablet, 'wide tablet'),
    getWidthProp(widescreen, 'wide widescreen'),
    getWidthProp(width, 'wide'),
    'column',
    className,
  )
  const rest = getUnhandledProps(GridColumn, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {children}
    </ElementType>
  )
}

GridColumn.displayName = 'GridColumn'
GridColumn.handledProps = [
  'as',
  'children',
  'className',
  'color',
  'computer',
  'floated',
  'largeScreen',
  'mobile',
  'only',
  'stretched',
  'tablet',
  'textAlign',
  'verticalAlign',
  'widescreen',
  'width',
]

GridColumn.create = createShorthandFactory(GridColumn, (children) => ({ children }))

export default GridColumn

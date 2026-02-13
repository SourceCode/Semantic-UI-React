import cx from 'clsx'
import * as React from 'react'

import {
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getMultipleProp,
  getTextAlignProp,
  getVerticalAlignProp,
  getWidthProp,
} from '../../lib'
import type {
  SemanticCOLORS,
  SemanticTEXTALIGNMENTS,
  SemanticVERTICALALIGNMENTS,
  SemanticWIDTHS,
} from '../../generic'
import type { GridOnlyProp } from './GridColumn'
import type { GridReversedProp } from './Grid'

export interface StrictGridRowProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A row can have its columns centered. */
  centered?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A grid row can be colored. */
  color?: SemanticCOLORS

  /** Represents column count per line in Row. */
  columns?: SemanticWIDTHS | 'equal'

  /** A row can have dividers between its columns. */
  divided?: boolean

  /** A row can appear only for a specific device, or screen sizes. */
  only?: GridOnlyProp

  /** A row can specify that its columns should reverse order at different device sizes. */
  reversed?: GridReversedProp

  /** A row can stretch its contents to take up the entire column height. */
  stretched?: boolean

  /** A row can specify its text alignment. */
  textAlign?: SemanticTEXTALIGNMENTS

  /** A row can specify its vertical alignment to have all its columns vertically centered. */
  verticalAlign?: SemanticVERTICALALIGNMENTS
}

export interface GridRowProps extends StrictGridRowProps {
  [key: string]: any
}

/**
 * A row sub-component for Grid.
 */
function GridRow({ ref, ...props }: GridRowProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    centered,
    children,
    className,
    color,
    columns,
    divided,
    only,
    reversed,
    stretched,
    textAlign,
    verticalAlign,
  } = props

  const classes = cx(
    color,
    getKeyOnly(centered, 'centered'),
    getKeyOnly(divided, 'divided'),
    getKeyOnly(stretched, 'stretched'),
    getMultipleProp(only, 'only'),
    getMultipleProp(reversed, 'reversed'),
    getTextAlignProp(textAlign),
    getVerticalAlignProp(verticalAlign),
    getWidthProp(columns, 'column', true),
    'row',
    className,
  )
  const rest = getUnhandledProps(GridRow, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {children}
    </ElementType>
  )
}

GridRow.displayName = 'GridRow'
GridRow.handledProps = [
  'as',
  'centered',
  'children',
  'className',
  'color',
  'columns',
  'divided',
  'only',
  'reversed',
  'stretched',
  'textAlign',
  'verticalAlign',
]

export default GridRow

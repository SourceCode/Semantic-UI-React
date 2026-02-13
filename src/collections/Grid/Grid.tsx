import cx from 'clsx'
import * as React from 'react'

import {
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getKeyOrValueAndKey,
  getMultipleProp,
  getTextAlignProp,
  getVerticalAlignProp,
  getWidthProp,
} from '../../lib'
import type {
  SemanticTEXTALIGNMENTS,
  SemanticVERTICALALIGNMENTS,
  SemanticWIDTHS,
} from '../../generic'
import GridColumn from './GridColumn'
import GridRow from './GridRow'

export type GridReversedProp =
  | string
  | 'computer'
  | 'computer vertically'
  | 'mobile'
  | 'mobile vertically'
  | 'tablet'
  | 'tablet vertically'

export interface StrictGridProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A grid can have rows divided into cells. */
  celled?: boolean | 'internally'

  /** A grid can have its columns centered. */
  centered?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Represents column count per row in Grid. */
  columns?: SemanticWIDTHS | 'equal'

  /** A grid can be combined with a container to use available layout and alignment. */
  container?: boolean

  /** A grid can have dividers between its columns. */
  divided?: boolean | 'vertically'

  /** A grid can double its column width on tablet and mobile sizes. */
  doubling?: boolean

  /** A grid's colors can be inverted. */
  inverted?: boolean

  /** A grid can preserve its vertical and horizontal gutters on first and last columns. */
  padded?: boolean | 'horizontally' | 'vertically'

  /** A grid can increase its gutters to allow for more negative space. */
  relaxed?: boolean | 'very'

  /** A grid can specify that its columns should reverse order at different device sizes. */
  reversed?: GridReversedProp

  /** A grid can have its columns stack on-top of each other after reaching mobile breakpoints. */
  stackable?: boolean

  /** A grid can stretch its contents to take up the entire grid height. */
  stretched?: boolean

  /** A grid can specify its text alignment. */
  textAlign?: SemanticTEXTALIGNMENTS

  /** A grid can specify its vertical alignment to have all its columns vertically centered. */
  verticalAlign?: SemanticVERTICALALIGNMENTS
}

export interface GridProps extends StrictGridProps {
  [key: string]: any
}

/**
 * A grid is used to harmonize negative space in a layout.
 */
function Grid({ ref, ...props }: GridProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    celled,
    centered,
    children,
    className,
    columns,
    container,
    divided,
    doubling,
    inverted,
    padded,
    relaxed,
    reversed,
    stackable,
    stretched,
    textAlign,
    verticalAlign,
  } = props

  const classes = cx(
    'ui',
    getKeyOnly(centered, 'centered'),
    getKeyOnly(container, 'container'),
    getKeyOnly(doubling, 'doubling'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(stackable, 'stackable'),
    getKeyOnly(stretched, 'stretched'),
    getKeyOrValueAndKey(celled, 'celled'),
    getKeyOrValueAndKey(divided, 'divided'),
    getKeyOrValueAndKey(padded, 'padded'),
    getKeyOrValueAndKey(relaxed, 'relaxed'),
    getMultipleProp(reversed, 'reversed'),
    getTextAlignProp(textAlign),
    getVerticalAlignProp(verticalAlign),
    getWidthProp(columns, 'column', true),
    'grid',
    className,
  )
  const rest = getUnhandledProps(Grid, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {children}
    </ElementType>
  )
}

Grid.Column = GridColumn
Grid.Row = GridRow

Grid.displayName = 'Grid'
Grid.handledProps = [
  'as',
  'celled',
  'centered',
  'children',
  'className',
  'columns',
  'container',
  'divided',
  'doubling',
  'inverted',
  'padded',
  'relaxed',
  'reversed',
  'stackable',
  'stretched',
  'textAlign',
  'verticalAlign',
]

export default Grid

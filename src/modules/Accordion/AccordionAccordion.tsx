import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  useAutoControlledValue,
  useEventCallback,
} from '../../lib'
import type { SemanticShorthandCollection } from '../../generic'
import type { AccordionPanelProps } from './AccordionPanel'
import type { AccordionTitleProps } from './AccordionTitle'
import AccordionPanel from './AccordionPanel'

/**
 * @param {Boolean} exclusive
 * @param {Number} activeIndex
 * @param {Number} itemIndex
 */
function isIndexActive(exclusive: boolean, activeIndex: any, itemIndex: number) {
  return exclusive ? activeIndex === itemIndex : _.includes(activeIndex, itemIndex)
}

/**
 * @param {Boolean} exclusive
 * @param {Number} activeIndex
 * @param {Number} itemIndex
 */
function computeNewIndex(exclusive: boolean, activeIndex: any, itemIndex: number) {
  if (exclusive) {
    return itemIndex === activeIndex ? -1 : itemIndex
  }

  // check to see if index is in array, and remove it, if not then add it
  if (_.includes(activeIndex, itemIndex)) {
    return _.without(activeIndex, itemIndex)
  }

  return [...activeIndex, itemIndex]
}

export interface StrictAccordionAccordionProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Index of the currently active panel. */
  activeIndex?: number | number[]

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Initial activeIndex value. */
  defaultActiveIndex?: number | number[]

  /** Only allow one panel open at a time. */
  exclusive?: boolean

  /**
   * Called when a panel title is clicked.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {AccordionTitleProps} data - All item props.
   */
  onTitleClick?: (event: React.MouseEvent<HTMLDivElement>, data: AccordionTitleProps) => void

  /** Shorthand array of props for Accordion. */
  panels?: SemanticShorthandCollection<AccordionPanelProps>
}

export interface AccordionAccordionProps extends StrictAccordionAccordionProps {
  [key: string]: any
}

/**
 * An Accordion can contain sub-accordions.
 */
function AccordionAccordion({ ref, ...props }: AccordionAccordionProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, children, exclusive = true, panels } = props
  const [activeIndex, setActiveIndex] = useAutoControlledValue({
    state: props.activeIndex,
    defaultState: props.defaultActiveIndex,
    initialState: () => (exclusive ? -1 : []),
  })

  const classes = cx('accordion', className)
  const rest = getUnhandledProps(AccordionAccordion, props)
  const ElementType = getComponentType(props)

  const handleTitleClick = useEventCallback((e: React.MouseEvent<HTMLDivElement>, titleProps: AccordionTitleProps) => {
    const { index } = titleProps

    setActiveIndex(computeNewIndex(exclusive, activeIndex, index as number))
    _.invoke(props, 'onTitleClick', e, titleProps)
  })

  // Validation effect: the process.env.NODE_ENV check is moved inside the effect
  // so the hook is called unconditionally (satisfying the Rules of Hooks for the
  // React Compiler). The check is still compiled away in production builds.
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      if (exclusive && typeof activeIndex !== 'number') {
        console.error('`activeIndex` must be a number if `exclusive` is true')
      } else if (!exclusive && !_.isArray(activeIndex)) {
        console.error('`activeIndex` must be an array if `exclusive` is false')
      }
    }
  }, [exclusive, activeIndex])

  return (
    <ElementType {...rest} className={classes} ref={ref}>
      {childrenUtils.isNil(children)
        ? _.map(panels, (panel, index) =>
            AccordionPanel.create(panel, {
              defaultProps: {
                active: isIndexActive(exclusive, activeIndex, index),
                index,
                onTitleClick: handleTitleClick,
              },
            }),
          )
        : children}
    </ElementType>
  )
}

AccordionAccordion.displayName = 'AccordionAccordion'
AccordionAccordion.handledProps = [
  'as',
  'activeIndex',
  'children',
  'className',
  'defaultActiveIndex',
  'exclusive',
  'onTitleClick',
  'panels',
]

AccordionAccordion.create = createShorthandFactory(AccordionAccordion, (content) => ({ content }))

export default AccordionAccordion

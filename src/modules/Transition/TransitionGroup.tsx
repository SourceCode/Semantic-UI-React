import _ from 'lodash'
import * as React from 'react'

import {
  getComponentType,
  getUnhandledProps,
  makeDebugger,
  useEventCallback,
  useForceUpdate } from '../../lib'
import type { SemanticTRANSITIONS } from '../../generic'
import type { TransitionEventData, TransitionPropDuration } from './Transition'
import { getChildMapping, mergeChildMappings } from './utils/childMapping'
import wrapChild from './utils/wrapChild'

const debug = makeDebugger('transition_group')

export interface StrictTransitionGroupProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Named animation event to used. Must be defined in CSS. */
  animation?: SemanticTRANSITIONS | string

  /** Primary content. */
  children?: React.ReactNode

  /** Whether it is directional animation event or not. Use it only for custom transitions. */
  directional?: boolean

  /** Duration of the CSS transition animation in milliseconds. */
  duration?: number | string | TransitionPropDuration
}

export interface TransitionGroupProps extends StrictTransitionGroupProps {
  [key: string]: any
}

/**
 * Wraps all children elements with proper callbacks and props.
 *
 * @param {React.ReactNode} children
 * @param {String} animation
 * @param {Number|String|Object} duration
 * @param {Boolean} directional
 *
 * @return {Object}
 */
function useWrappedChildren(
  children: React.ReactNode,
  animation: string,
  duration: number | string | TransitionPropDuration,
  directional: boolean | undefined,
): Record<string, React.ReactElement<any>> {
  debug('wrapChildren()')

  const forceUpdate = useForceUpdate()
  const previousChildren = React.useRef<Record<string, React.ReactElement<any>>>(undefined)

  let wrappedChildren: Record<string, React.ReactElement<any>>
  React.useEffect(() => {
    previousChildren.current = wrappedChildren
  })

  const handleChildHide = useEventCallback((nothing: null, childProps: TransitionEventData) => {
    debug('handleOnHide', childProps)
    const { reactKey } = childProps

    delete previousChildren.current![reactKey!]
    forceUpdate()
  })

  // A short circuit for an initial render as there will be no `prevMapping`
  if (typeof previousChildren.current === 'undefined') {
    wrappedChildren = _.mapValues(getChildMapping(children), (child: React.ReactElement<any>) =>
      wrapChild(child, handleChildHide, {
        animation,
        duration,
        directional,
      }),
    ) as Record<string, React.ReactElement<any>>
  } else {
    const nextMapping = getChildMapping(children)
    wrappedChildren = mergeChildMappings(previousChildren.current, nextMapping)

    _.forEach(wrappedChildren, (child: React.ReactElement<any>, key: string) => {
      const hasPrev = previousChildren.current![key]
      const hasNext = nextMapping[key]

      const prevChild = previousChildren.current![key]
      const isLeaving = !_.get(prevChild, 'props.visible')

      // Heads up!
      // An item is new (entering), it will be picked from `nextChildren`, so it should be wrapped
      if (hasNext && (!hasPrev || isLeaving)) {
        wrappedChildren[key] = wrapChild(child, handleChildHide, {
          animation,
          duration,
          directional,
          transitionOnMount: true,
        })
        return
      }

      // Heads up!
      // An item is old (exiting), it will be picked from `prevChildren`, so we create a fresh
      // Transition wrapper with visible: false to trigger the exit animation
      if (!hasNext && hasPrev && !isLeaving) {
        wrappedChildren[key] = wrapChild(prevChild.props.children, handleChildHide, {
          animation,
          duration,
          directional,
          transitionOnMount: prevChild.props.transitionOnMount,
          visible: false,
        })
        return
      }

      // Heads up!
      // An item item hasn't changed transition states, but it will be picked from `nextChildren`,
      // so we should wrap it again
      const {
        props: { visible, transitionOnMount },
      } = prevChild

      wrappedChildren[key] = wrapChild(child, handleChildHide, {
        animation,
        duration,
        directional,
        transitionOnMount,
        visible,
      })
    })
  }

  return wrappedChildren
}

/**
 * A Transition.Group animates children as they mount and unmount.
 */
function TransitionGroup({ ref, ...props }: TransitionGroupProps & { ref?: React.Ref<HTMLDivElement> }) {
  debug('render')
  debug('props', props)

  const children = useWrappedChildren(
    props.children,
    props.animation ?? 'fade',
    props.duration ?? 500,
    props.directional,
  )

  const ElementType = getComponentType(props, { defaultAs: React.Fragment })
  const rest = getUnhandledProps(TransitionGroup, props)

  // React.Fragment does not accept ref prop
  if (ElementType === React.Fragment) {
    return (
      <React.Fragment>
        {_.values(children)}
      </React.Fragment>
    )
  }

  return (
    <ElementType {...rest} ref={ref}>
      {_.values(children)}
    </ElementType>
  )
}

TransitionGroup.displayName = 'TransitionGroup'
TransitionGroup.handledProps = [
  'as',
  'animation',
  'children',
  'directional',
  'duration',
]

export default TransitionGroup

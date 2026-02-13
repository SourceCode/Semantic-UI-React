import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import { makeDebugger, normalizeTransitionDuration, SUI, getKeyOnly } from '../../lib'
import type { SemanticTRANSITIONS } from '../../generic'
import TransitionGroup from './TransitionGroup'
import {
  computeStatuses,
  TRANSITION_STATUS_ENTERED,
  TRANSITION_STATUS_ENTERING,
  TRANSITION_STATUS_EXITED,
  TRANSITION_STATUS_EXITING,
  TRANSITION_STATUS_INITIAL,
  TRANSITION_STATUS_UNMOUNTED,
} from './utils/computeStatuses'

const debug = makeDebugger('transition')

export type TRANSITION_STATUSES = 'ENTERED' | 'ENTERING' | 'EXITED' | 'EXITING' | 'UNMOUNTED'

export interface TransitionPropDuration {
  hide: number
  show: number
}

export interface TransitionEventData extends TransitionProps {
  status: TRANSITION_STATUSES
}

export interface StrictTransitionProps {
  /** Named animation event to used. Must be defined in CSS. */
  animation?: SemanticTRANSITIONS | string

  /** Primary content. */
  children?: React.ReactNode

  /** Whether it is directional animation event or not. Use it only for custom transitions. */
  directional?: boolean

  /** Duration of the CSS transition animation in milliseconds. */
  duration?: number | string | TransitionPropDuration

  /** Show the component; triggers the enter or exit animation. */
  visible?: boolean

  /** Wait until the first "enter" transition to mount the component (add it to the DOM). */
  mountOnShow?: boolean

  /**
   * Callback on each transition that changes visibility to shown.
   *
   * @param {null}
   * @param {object} data - All props with status.
   */
  onComplete?: (nothing: null, data: TransitionEventData) => void

  /**
   * Callback on each transition that changes visibility to hidden.
   *
   * @param {null}
   * @param {object} data - All props with status.
   */
  onHide?: (nothing: null, data: TransitionEventData) => void

  /**
   * Callback on each transition that changes visibility to shown.
   *
   * @param {null}
   * @param {object} data - All props with status.
   */
  onShow?: (nothing: null, data: TransitionEventData) => void

  /**
   * Callback on animation start.
   *
   * @param {null}
   * @param {object} data - All props with status.
   */
  onStart?: (nothing: null, data: TransitionEventData) => void

  /** React's key of the element. */
  reactKey?: string

  /** Run the enter animation when the component mounts, if it is initially shown. */
  transitionOnMount?: boolean

  /** Unmount the component (remove it from the DOM) when it is not shown. */
  unmountOnHide?: boolean
}

export interface TransitionProps extends StrictTransitionProps {
  [key: string]: any
}

const TRANSITION_CALLBACK_TYPE: Record<string, string> = {
  [TRANSITION_STATUS_ENTERED]: 'show',
  [TRANSITION_STATUS_EXITED]: 'hide',
}
const TRANSITION_STYLE_TYPE: Record<string, string> = {
  [TRANSITION_STATUS_ENTERING]: 'show',
  [TRANSITION_STATUS_EXITING]: 'hide',
}

/**
 * A transition is an animation usually used to move content in or out of view.
 */
function Transition(props: TransitionProps) {
  const {
    animation = 'fade',
    children,
    directional,
    duration = 500,
    mountOnShow = true,
    onComplete,
    onHide,
    onShow,
    onStart,
    transitionOnMount = false,
    unmountOnHide = false,
    visible = true,
  } = props

  const [state, setState] = React.useState({
    status: TRANSITION_STATUS_INITIAL as string,
    animating: false,
    nextStatus: undefined as string | undefined,
  })

  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevStateRef = React.useRef<{ status?: string; animating?: boolean }>({})

  // Replace getDerivedStateFromProps: compute derived state during render
  const derived = computeStatuses({
    mountOnShow,
    status: state.status,
    transitionOnMount,
    visible,
    unmountOnHide,
  })

  // Determine effective state values (derived overrides current state)
  let currentStatus = state.status
  let currentAnimating = state.animating
  let currentNextStatus = state.nextStatus

  if (Object.keys(derived).length > 0) {
    const needsUpdate =
      ('status' in derived && derived.status !== state.status) ||
      ('animating' in derived && derived.animating !== state.animating) ||
      ('nextStatus' in derived && derived.nextStatus !== state.nextStatus)

    if (needsUpdate) {
      setState((prev) => ({ ...prev, ...derived }))
    }

    if ('status' in derived) currentStatus = derived.status!
    if ('animating' in derived) currentAnimating = derived.animating!
    if ('nextStatus' in derived) currentNextStatus = derived.nextStatus
  }

  debug('render(): props', props)
  debug('render(): state', { status: currentStatus, animating: currentAnimating, nextStatus: currentNextStatus })

  // Construct props with defaults applied for callbacks
  const propsWithDefaults = { ...props, animation, duration, mountOnShow, transitionOnMount, unmountOnHide, visible }

  // Replace componentDidMount + componentDidUpdate
  React.useEffect(() => {
    const prevState = prevStateRef.current
    prevStateRef.current = { status: currentStatus, animating: currentAnimating }

    // When status changes, manage animation timer
    if (prevState.status !== currentStatus) {
      clearTimeout(timeoutRef.current!)

      if (currentNextStatus) {
        const durationType = TRANSITION_CALLBACK_TYPE[currentNextStatus]
        const durationValue = normalizeTransitionDuration(duration, durationType)

        if (durationValue === 0) {
          setState((prev) => ({ ...prev, status: currentNextStatus! }))
        } else {
          timeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, status: currentNextStatus! }))
          }, durationValue)
        }
      }
    }

    // Callback: animation started
    if (!prevState.animating && currentAnimating) {
      if (onStart) onStart(null, { ...propsWithDefaults, status: currentStatus } as TransitionEventData)
    }

    // Callback: animation ended
    if (prevState.animating && !currentAnimating) {
      if (onComplete) onComplete(null, { ...propsWithDefaults, status: currentStatus } as TransitionEventData)

      if (currentStatus === TRANSITION_STATUS_ENTERED) {
        if (onShow) onShow(null, { ...propsWithDefaults, status: currentStatus } as TransitionEventData)
      } else {
        if (onHide) onHide(null, { ...propsWithDefaults, status: currentStatus } as TransitionEventData)
      }
    }
  })

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      debug('unmount cleanup')
      clearTimeout(timeoutRef.current!)
    }
  }, [])

  // Render
  if (currentStatus === TRANSITION_STATUS_UNMOUNTED) {
    return null
  }

  const childClasses = _.get(children, 'props.className')
  const isDirectional = _.isNil(directional)
    ? _.includes(SUI.DIRECTIONAL_TRANSITIONS, animation)
    : directional

  let computedClassName: string
  if (isDirectional) {
    computedClassName = cx(
      animation,
      childClasses,
      getKeyOnly(currentAnimating, 'animating'),
      getKeyOnly(currentStatus === TRANSITION_STATUS_ENTERING, 'in'),
      getKeyOnly(currentStatus === TRANSITION_STATUS_EXITING, 'out'),
      getKeyOnly(currentStatus === TRANSITION_STATUS_EXITED, 'hidden'),
      getKeyOnly(currentStatus !== TRANSITION_STATUS_EXITED, 'visible'),
      'transition',
    )
  } else {
    computedClassName = cx(animation, childClasses, getKeyOnly(currentAnimating, 'animating transition'))
  }

  const childStyle: Record<string, any> = _.get(children, 'props.style') || {}
  const styleType = TRANSITION_STYLE_TYPE[currentStatus]
  const animationDuration = styleType && `${normalizeTransitionDuration(duration, styleType)}ms`
  const computedStyle = { ...childStyle, animationDuration }

  const transitionProps: Record<string, any> = {
    className: computedClassName,
    style: computedStyle,
    ...(process.env.NODE_ENV !== 'production' && {
      'data-test-status': currentStatus,
      'data-test-next-status': currentNextStatus,
    }),
  }

  // Render prop pattern (preferred): children as function receives transition props
  if (typeof children === 'function') {
    return (children as (props: Record<string, any>) => React.ReactNode)(transitionProps)
  }

  // Legacy pattern: cloneElement to inject transition props onto a React element.
  // Retained for backward compatibility. The render prop pattern above is preferred
  // because it avoids cloneElement and makes the data flow explicit.
  return React.cloneElement(children as React.ReactElement, transitionProps)
}

Transition.displayName = 'Transition'
Transition.Group = TransitionGroup

Transition.handledProps = [
  'animation',
  'children',
  'directional',
  'duration',
  'visible',
  'mountOnShow',
  'onComplete',
  'onHide',
  'onShow',
  'onStart',
  'reactKey',
  'transitionOnMount',
  'unmountOnHide',
]

Transition.defaultProps = {
  animation: 'fade',
  duration: 500,
  visible: true,
  mountOnShow: true,
  transitionOnMount: false,
  unmountOnHide: false,
}

export default Transition

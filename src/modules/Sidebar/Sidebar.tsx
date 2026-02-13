import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  doesNodeContainClick,
  getUnhandledProps,
  getComponentType,
  isRefObject,
  getKeyOnly,
  useIsomorphicLayoutEffect,
  useEventCallback,
  useForceUpdate,
  useMergedRefs,
  usePrevious } from '../../lib'
import type { SemanticShorthandContent } from '../../generic'
import SidebarPushable from './SidebarPushable'
import SidebarPusher from './SidebarPusher'

export interface StrictSidebarProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** Animation style. */
  animation?: 'overlay' | 'push' | 'scale down' | 'uncover' | 'slide out' | 'slide along'

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Direction the sidebar should appear on. */
  direction?: 'top' | 'right' | 'bottom' | 'left'

  /**
   * Called before a sidebar begins to animate out.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onHide?: (event: React.MouseEvent<HTMLElement> | null, data: SidebarProps) => void

  /**
   * Called after a sidebar has finished animating out.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onHidden?: (event: null, data: SidebarProps) => void

  /**
   * Called when a sidebar has finished animating in.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onShow?: (event: null, data: SidebarProps) => void

  /**
   * Called when a sidebar begins animating in.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onVisible?: (event: null, data: SidebarProps) => void

  /** A sidebar can handle clicks on the passed element. */
  target?: Document | Window | HTMLElement | React.RefObject<HTMLElement>

  /** Controls whether or not the sidebar is visible on the page. */
  visible?: boolean

  /** Sidebar width. */
  width?: 'very thin' | 'thin' | 'wide' | 'very wide'
}

export interface SidebarProps extends StrictSidebarProps {
  [key: string]: any
}

/**
 * We use `animationTick` to understand when an animation should be scheduled.
 *
 * @param {Boolean} visible
 */
function useAnimationTick(visible: boolean | undefined): [number, () => void] {
  const previousVisible = usePrevious(visible)
  const tickIncrement = !!visible === !!previousVisible ? 0 : 1

  const animationTick = React.useRef(0)
  const forceUpdate = useForceUpdate()

  const currentTick = animationTick.current + tickIncrement
  const resetAnimationTick = React.useCallback(() => {
    animationTick.current = 0
    forceUpdate()
  }, [])

  React.useEffect(() => {
    animationTick.current = currentTick
  })

  return [currentTick, resetAnimationTick]
}

/**
 * A sidebar hides additional content beside a page.
 */
const Sidebar = ({ ref, ...props }: SidebarProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const {
    animation,
    className,
    children,
    content,
    direction = 'left',
    target,
    visible = false,
    width,
  } = props

  const [animationTick, resetAnimationTick] = useAnimationTick(visible)
  const elementRef = useMergedRefs(ref, React.useRef<HTMLDivElement>(null))

  const animationTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const skipNextCallback = React.useRef<boolean>(undefined)

  const handleAnimationEnd = useEventCallback(() => {
    const callback = visible ? 'onShow' : 'onHidden'

    resetAnimationTick()
    _.invoke(props, callback, null, props)
  })

  const handleAnimationStart = useEventCallback(() => {
    const callback = visible ? 'onVisible' : 'onHide'

    clearTimeout(animationTimer.current)
    animationTimer.current = setTimeout(handleAnimationEnd, Sidebar.animationDuration)

    if (skipNextCallback.current) {
      skipNextCallback.current = false
      return
    }

    _.invoke(props, callback, null, props)
  })

  const handleDocumentClick = useEventCallback((e: MouseEvent) => {
    if (!doesNodeContainClick(elementRef.current, e as any)) {
      skipNextCallback.current = true
      _.invoke(props, 'onHide', e, { ...props, visible: false })
    }
  })

  useIsomorphicLayoutEffect(() => {
    handleAnimationStart()
  }, [animationTick])

  React.useEffect(() => {
    return () => {
      clearTimeout(animationTimer.current)
    }
  }, [])

  // Replace EventListener with native useEffect document event listener
  React.useEffect(() => {
    if (!visible) {
      return
    }

    const targetNode: EventTarget | null = isRefObject(target)
      ? (target as React.RefObject<HTMLElement>).current
      : (target as EventTarget | undefined) ?? document

    if (targetNode) {
      targetNode.addEventListener('click', handleDocumentClick as EventListener)
    }

    return () => {
      if (targetNode) {
        targetNode.removeEventListener('click', handleDocumentClick as EventListener)
      }
    }
  }, [visible, target, handleDocumentClick])

  const classes = cx(
    'ui',
    animation,
    direction,
    width,
    getKeyOnly(animationTick > 0, 'animating'),
    getKeyOnly(visible, 'visible'),
    'sidebar',
    className,
  )
  const rest = getUnhandledProps(Sidebar, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType {...rest} className={classes} ref={elementRef}>
      {childrenUtils.isNil(children) ? content : children}
    </ElementType>
  )
}

Sidebar.displayName = 'Sidebar'
Sidebar.handledProps = [
  'as',
  'animation',
  'children',
  'className',
  'content',
  'direction',
  'onHide',
  'onHidden',
  'onShow',
  'onVisible',
  'target',
  'visible',
  'width',
]

Sidebar.animationDuration = 500

Sidebar.Pushable = SidebarPushable
Sidebar.Pusher = SidebarPusher

export default Sidebar

import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  getComponentType,
  getUnhandledProps,
  isRefObject,
  isBrowser,
  useEventCallback,
  useIsomorphicLayoutEffect } from '../../lib'

export interface StrictStickyProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A Sticky can be active. */
  active?: boolean

  /** Offset in pixels from the bottom of the screen when fixing element to viewport. */
  bottomOffset?: number

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Context which sticky element should stick to. */
  context?: Document | Window | HTMLElement | React.Ref<HTMLElement>

  /** Offset in pixels from the top of the screen when fixing element to viewport. */
  offset?: number

  /**
   * Callback when element is bound to bottom of parent container.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onBottom?: (event: Event, data: StickyProps) => void

  /**
   * Callback when element is fixed to page.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onStick?: (event: Event, data: StickyProps) => void

  /**
   * Callback when element is bound to top of parent container.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onTop?: (event: Event, data: StickyProps) => void

  /**
   * Callback when element is unfixed from page.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onUnstick?: (event: Event, data: StickyProps) => void

  /** Whether element should be "pushed" by the viewport, attaching to the bottom of the screen when scrolling up. */
  pushing?: boolean

  /** Context which sticky should attach onscroll events. */
  scrollContext?: Document | Window | HTMLElement | React.Ref<HTMLElement>

  /** Custom style for sticky element. */
  styleElement?: React.CSSProperties
}

export interface StickyProps extends StrictStickyProps {
  [key: string]: any
}

/**
 * Sticky content stays fixed to the browser viewport while another column of content is visible on the page.
 */
function Sticky({ ref, ...props }: StickyProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active = true,
    bottomOffset = 0,
    children,
    className,
    context,
    offset = 0,
    scrollContext = isBrowser() ? window : null,
    styleElement,
  } = props

  const [sticky, setSticky] = React.useState(false)
  const [bound, setBound] = React.useState<boolean | undefined>()
  const [bottom, setBottom] = React.useState<number | null | undefined>()
  const [pushing, setPushing] = React.useState<boolean | undefined>()
  const [top, setTop] = React.useState<number | null | undefined>()

  const stickyRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLDivElement>(null)

  const triggerRect = React.useRef<DOMRect>(undefined)
  const contextRect = React.useRef<DOMRect>(undefined)
  const stickyRect = React.useRef<DOMRect>(undefined)

  const frameId = React.useRef<number>(undefined)
  const ticking = React.useRef<boolean>(undefined)

  // ----------------------------------------
  // Helpers
  // ----------------------------------------

  const assignRects = () => {
    const contextNode = isRefObject(context) ? (context as React.RefObject<HTMLElement>).current : (context as HTMLElement) || document.body

    triggerRect.current = triggerRef.current!.getBoundingClientRect()
    contextRect.current = contextNode!.getBoundingClientRect()
    stickyRect.current = stickyRef.current!.getBoundingClientRect()
  }

  const computeStyle = (): React.CSSProperties | undefined => {
    if (!sticky) {
      return styleElement
    }

    return {
      bottom: bound ? 0 : (bottom as number | undefined),
      top: bound ? undefined : (top as number | undefined),
      width: triggerRect.current!.width,
      ...styleElement,
    }
  }

  // Return true when the component reached the bottom of the context
  const didReachContextBottom = () =>
    stickyRect.current!.height + offset >= contextRect.current!.bottom

  // Return true when the component reached the starting point
  const didReachStartingPoint = () => stickyRect.current!.top <= triggerRect.current!.top

  // Return true when the top of the screen overpasses the Sticky component
  const didTouchScreenTop = () => triggerRect.current!.top < offset

  // Return true when the bottom of the screen overpasses the Sticky component
  const didTouchScreenBottom = () => contextRect.current!.bottom + bottomOffset > window.innerHeight

  // Return true if the height of the component is higher than the window
  const isOversized = () => stickyRect.current!.height > window.innerHeight

  // ----------------------------------------
  // Stick helpers
  // ----------------------------------------

  // If true, the component will stick to the bottom of the screen instead of the top
  const togglePushing = (value: boolean) => {
    if (props.pushing) {
      setPushing(value)
    }
  }

  const setSticked = (e: Event, newBound: boolean) => {
    setBound(newBound)
    setSticky(true)

    _.invoke(props, 'onStick', e, props)
  }

  const setUnsticked = (e: Event, newBound: boolean) => {
    setBound(newBound)
    setSticky(false)

    _.invoke(props, 'onUnstick', e, props)
  }

  const stickToContextBottom = (e: Event) => {
    setSticked(e, true)
    togglePushing(true)

    _.invoke(props, 'onBottom', e, props)
  }

  const stickToContextTop = (e: Event) => {
    setUnsticked(e, false)
    togglePushing(false)

    _.invoke(props, 'onTop', e, props)
  }

  const stickToScreenBottom = (e: Event) => {
    setSticked(e, false)

    setBottom(bottomOffset)
    setTop(null)
  }

  const stickToScreenTop = (e: Event) => {
    setSticked(e, false)

    setBottom(null)
    setTop(offset)
  }

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const update = (e: Event) => {
    ticking.current = false
    assignRects()

    if (pushing) {
      if (didReachStartingPoint()) {
        stickToContextTop(e)
        return
      }

      if (didTouchScreenBottom()) {
        stickToScreenBottom(e)
        return
      }

      stickToContextBottom(e)
      return
    }

    if (isOversized()) {
      if (contextRect.current!.top > 0) {
        stickToContextTop(e)
        return
      }

      if (contextRect.current!.bottom < window.innerHeight) {
        stickToContextBottom(e)
        return
      }
    }

    if (didTouchScreenTop()) {
      if (didReachContextBottom()) {
        stickToContextBottom(e)
        return
      }

      stickToScreenTop(e)
      return
    }

    stickToContextTop(e)
  }

  const handleUpdate = useEventCallback((e: Event) => {
    if (!ticking.current) {
      ticking.current = true
      frameId.current = requestAnimationFrame(() => update(e))
    }
  })

  // ----------------------------------------
  // State control
  // ----------------------------------------

  useIsomorphicLayoutEffect(() => {
    if (!active) {
      setSticky(false)
    }
  }, [active])

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  useIsomorphicLayoutEffect(() => {
    if (active) {
      handleUpdate(new Event('init'))
    }
  }, [active])

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(frameId.current!)
    }
  }, [])

  // ----------------------------------------
  // Document events
  // ----------------------------------------

  React.useEffect(() => {
    const scrollContextNode = isRefObject(scrollContext) ? (scrollContext as React.RefObject<EventTarget>).current : scrollContext as EventTarget | null

    if (active && scrollContextNode) {
      scrollContextNode?.addEventListener('resize', handleUpdate)
      scrollContextNode?.addEventListener('scroll', handleUpdate)
    }

    return () => {
      scrollContextNode?.removeEventListener('resize', handleUpdate)
      scrollContextNode?.removeEventListener('scroll', handleUpdate)
    }
  }, [active, scrollContext])

  // ----------------------------------------
  // Render
  // ----------------------------------------

  const rest = getUnhandledProps(Sticky, props)
  const ElementType = getComponentType(props)

  const containerClasses = cx(
    sticky && 'ui',
    sticky && 'stuck-container',
    sticky && (bound ? 'bound-container' : 'fixed-container'),
    className,
  )
  const elementClasses = cx(
    'ui',
    sticky && (bound ? 'bound bottom' : 'fixed'),
    sticky && !bound && (bottom === null ? 'top' : 'bottom'),
    'sticky',
  )
  const triggerStyles: React.CSSProperties = sticky ? { height: stickyRect.current?.height } : {}

  return (
    <ElementType {...rest} className={containerClasses} ref={ref}>
      <div ref={triggerRef} style={triggerStyles} />
      <div className={elementClasses} ref={stickyRef} style={computeStyle()}>
        {children}
      </div>
    </ElementType>
  )
}

Sticky.displayName = 'Sticky'
Sticky.handledProps = [
  'as',
  'active',
  'bottomOffset',
  'children',
  'className',
  'context',
  'offset',
  'onBottom',
  'onStick',
  'onTop',
  'onUnstick',
  'pushing',
  'scrollContext',
  'styleElement',
]

export default Sticky

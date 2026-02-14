import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'
import { useFloating, flip, offset as floatingOffset, shift, autoUpdate } from '@floating-ui/react-dom'
import type { Placement, Middleware } from '@floating-ui/react-dom'
import shallowEqual from '../../lib/shallowEqual'

import {
  childrenUtils,
  createHTMLDivision,
  getComponentType,
  getUnhandledProps,
  isRefObject,
  makeDebugger,

  useIsomorphicLayoutEffect,
  getKeyOnly,
  getKeyOrValueAndKey,
  useMergedRefs,
  usePrevious,
} from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import Portal from '../../addons/Portal'
import type { StrictPortalProps } from '../../addons/Portal'
import { placementMapping, positionsMapping } from './lib/positions'
import PopupContent from './PopupContent'
import type { PopupContentProps } from './PopupContent'
import PopupHeader from './PopupHeader'
import type { PopupHeaderProps } from './PopupHeader'

const debug = makeDebugger('popup')

type OffsetFunctionParams = {
  popper: { x: number; y: number; width: number; height: number }
  reference: { x: number; y: number; width: number; height: number }
  placement: Placement
}
type OffsetFunction = (params: OffsetFunctionParams) => [number?, number?]

export interface StrictPopupProps extends StrictPortalProps {
  /** An element type to render as (string or function). */
  as?: any

  /** Display the popup without the pointing arrow */
  basic?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Simple text content for the popover. */
  content?: SemanticShorthandItem<PopupContentProps>

  /** Existing element the pop-up should be bound to. */
  context?: Document | Window | HTMLElement | React.RefObject<HTMLElement>

  /** A disabled popup only renders its trigger. */
  disabled?: boolean

  /** Enables automatic repositioning on scroll and resize. */
  eventsEnabled?: boolean

  /** A flowing Popup has no maximum width and continues to flow to fit its content. */
  flowing?: boolean

  /** Header displayed above the content in bold. */
  header?: SemanticShorthandItem<PopupHeaderProps>

  /** Hide the Popup when scrolling the window. */
  hideOnScroll?: boolean

  /** Whether the popup should not close on hover. */
  hoverable?: boolean

  /** Invert the colors of the popup */
  inverted?: boolean

  /**
   * Offset values in px unit to apply to rendered popup. The basic offset accepts an
   * array with two numbers in the form [skidding, distance]:
   * - `skidding` displaces the Popup along the reference element
   * - `distance` displaces the Popup away from, or toward, the reference element in the direction of its placement. A positive number displaces it further away, while a negative number lets it overlap the reference.
   *
   * @see https://floating-ui.com/docs/offset
   */
  offset?: [number, number?] | OffsetFunction

  /** Events triggering the popup. */
  on?: 'hover' | 'click' | 'focus' | ('hover' | 'click' | 'focus')[]

  /**
   * Called when a close event happens.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClose?: (event: React.MouseEvent<HTMLElement>, data: PopupProps) => void

  /**
   * Called when the portal is mounted on the DOM.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onMount?: (nothing: null, data: PopupProps) => void

  /**
   * Called when an open event happens.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onOpen?: (event: React.MouseEvent<HTMLElement>, data: PopupProps) => void

  /**
   * Called when the portal is unmounted from the DOM.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onUnmount?: (nothing: null, data: PopupProps) => void

  /** Disables automatic repositioning of the component, it will always be placed according to the position value. */
  pinned?: boolean

  /** Position for the popover. */
  position?:
    | 'top left'
    | 'top right'
    | 'bottom right'
    | 'bottom left'
    | 'right center'
    | 'left center'
    | 'top center'
    | 'bottom center'

  /** Tells Floating UI to use the `position: fixed` strategy to position the popover. */
  positionFixed?: boolean

  /** A wrapping element for an actual content that will be used for positioning. */
  popper?: SemanticShorthandItem<React.HTMLAttributes<HTMLDivElement>>

  /** An array containing custom Floating UI middleware. */
  popperModifiers?: Middleware[]

  /** A popup can have dependencies which update will schedule a position update. */
  popperDependencies?: any[]

  /** Popup size. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'huge'

  /** Custom Popup style. */
  style?: React.CSSProperties

  /** Element to be rendered in-place where the popup is defined. */
  trigger?: React.ReactNode

  /** Popup width. */
  wide?: boolean | 'very'
}

export interface PopupProps extends StrictPopupProps {
  [key: string]: any
}

/**
 * Calculates props specific for Portal component.
 *
 * @param {Object} props
 */
function getPortalProps(props: PopupProps) {
  const portalProps: Record<string, any> = {}

  const on = props.on ?? ['click', 'hover']
  const normalizedOn = _.isArray(on) ? on : [on]

  if (props.hoverable) {
    portalProps.closeOnPortalMouseLeave = true
    portalProps.mouseLeaveDelay = 300
  }

  if (_.includes(normalizedOn, 'hover')) {
    portalProps.openOnTriggerClick = false
    portalProps.closeOnTriggerClick = false
    portalProps.openOnTriggerMouseEnter = true
    portalProps.closeOnTriggerMouseLeave = true
    // Taken from SUI: https://git.io/vPmCm
    portalProps.mouseLeaveDelay = 70
    portalProps.mouseEnterDelay = 50
  }

  if (_.includes(normalizedOn, 'click')) {
    portalProps.openOnTriggerClick = true
    portalProps.closeOnTriggerClick = true
    portalProps.closeOnDocumentClick = true
  }

  if (_.includes(normalizedOn, 'focus')) {
    portalProps.openOnTriggerFocus = true
    portalProps.closeOnTriggerBlur = true
  }

  return portalProps
}

/**
 * Splits props for Portal & Popup.
 *
 * @param {Object} unhandledProps
 * @param {Boolean} disabled
 */
function partitionPortalProps(unhandledProps: Record<string, any>, disabled: boolean) {
  if (disabled) {
    return {} as { contentRestProps?: Record<string, any>; portalRestProps?: Record<string, any> }
  }

  const contentRestProps = _.reduce(
    unhandledProps,
    (acc: Record<string, any>, val: any, key: string) => {
      if (!_.includes((Portal as any).handledProps, key)) acc[key] = val

      return acc
    },
    {},
  )
  const portalRestProps = _.pick(unhandledProps, (Portal as any).handledProps)

  return { contentRestProps, portalRestProps }
}

/**
 * Resolves the actual DOM element from a context prop or triggerRef.
 */
function resolveReferenceElement(
  context: StrictPopupProps['context'],
  triggerRef: React.RefObject<HTMLElement | undefined>,
): Element | null {
  if (!_.isNil(context)) {
    if (isRefObject(context)) return (context as React.RefObject<HTMLElement>).current ?? null
    if (context instanceof Element) return context
    return null
  }
  return triggerRef.current ?? null
}

/**
 * A Popup displays additional information on top of a page.
 */
function Popup({ ref, ...props }: PopupProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    basic,
    className,
    content,
    context,
    children,
    disabled = false,
    eventsEnabled = true,
    flowing,
    header,
    hideOnScroll = false,
    inverted,
    offset,
    pinned = false,
    popper,
    popperDependencies,
    popperModifiers = [],
    position = 'top left',
    positionFixed,
    size,
    style,
    trigger,
    wide,
  } = props

  const unhandledProps = getUnhandledProps(Popup, props)
  const { contentRestProps, portalRestProps } = partitionPortalProps(unhandledProps, disabled)

  const elementRef = useMergedRefs(ref)
  const triggerRef = React.useRef<HTMLElement | undefined>(undefined)
  const zIndexWasSynced = React.useRef(false)

  // Keep a ref to the latest context so the virtual element can read it lazily
  const contextRef = React.useRef(context)
  contextRef.current = context

  // Create a stable virtual reference element that lazily resolves the actual DOM element.
  // This is needed because triggerRef.current is null until the trigger mounts, and
  // context may be a ref object whose .current changes over time.
  const [virtualReference] = React.useState(() => ({
    getBoundingClientRect() {
      const el = resolveReferenceElement(contextRef.current, triggerRef as React.RefObject<HTMLElement | undefined>)
      if (el && typeof el.getBoundingClientRect === 'function') {
        return el.getBoundingClientRect()
      }
      return { x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }
    },
    get contextElement() {
      const el = resolveReferenceElement(contextRef.current, triggerRef as React.RefObject<HTMLElement | undefined>)
      return el instanceof Element ? el : undefined
    },
  }))

  // Build Floating UI middleware
  const middleware: Middleware[] = []

  if (offset) {
    if (typeof offset === 'function') {
      middleware.push(floatingOffset(({ rects, placement: p }) => {
        const [skidding = 0, distance = 0] = offset({
          popper: rects.floating,
          reference: rects.reference,
          placement: p,
        })
        return { mainAxis: distance, crossAxis: skidding }
      }))
    } else {
      const [skidding = 0, distance = 0] = offset
      middleware.push(floatingOffset({ mainAxis: distance, crossAxis: skidding }))
    }
  }

  if (!pinned) {
    middleware.push(flip())
  }

  if (offset) {
    middleware.push(shift())
  }

  middleware.push(...popperModifiers)

  const { refs, floatingStyles, placement: computedPlacement, update } = useFloating({
    elements: { reference: virtualReference as any },
    placement: positionsMapping[position as keyof typeof positionsMapping],
    strategy: positionFixed ? 'fixed' : 'absolute',
    middleware,
    whileElementsMounted: eventsEnabled ? autoUpdate : undefined,
  })

  // ----------------------------------------
  // Effects
  // ----------------------------------------

  // Trigger position update when popperDependencies change
  const previousDependencies = usePrevious(popperDependencies)

  useIsomorphicLayoutEffect(() => {
    if (update) {
      update()
    }
  }, [shallowEqual(previousDependencies, popperDependencies)])

  // Sync zIndex from inner `.ui.popup` to the outer wrapper div to avoid layering issues
  // https://github.com/Semantic-Org/Semantic-UI-React/issues/4083
  useIsomorphicLayoutEffect(() => {
    if (zIndexWasSynced.current) return

    const floatingEl = refs.floating.current
    if (!floatingEl?.firstChild) return

    // If zIndex is defined in <Popup popper={{ style: {} }} /> there is no sense to override it
    const definedZIndex = (popper as any)?.style?.zIndex

    if (_.isUndefined(definedZIndex)) {
      ;(floatingEl as HTMLElement).style.zIndex = window.getComputedStyle(
        floatingEl.firstChild as Element,
      ).zIndex
    }

    zIndexWasSynced.current = true
  })

  // ----------------------------------------
  // Handlers
  // ----------------------------------------

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    debug('handleClose()')
    _.invoke(props, 'onClose', e, { ...props, open: false })
  }

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    debug('handleOpen()')
    _.invoke(props, 'onOpen', e, { ...props, open: true })
  }

  const handlePortalMount = (e: null) => {
    debug('handlePortalMount()')
    _.invoke(props, 'onMount', e, props)
  }

  const handlePortalUnmount = (e: null) => {
    debug('handlePortalUnmount()')

    zIndexWasSynced.current = false
    _.invoke(props, 'onUnmount', e, props)
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  if (disabled) {
    return trigger
  }

  const classes = cx(
    'ui',
    placementMapping[computedPlacement],
    size,
    getKeyOrValueAndKey(wide, 'wide'),
    getKeyOnly(basic, 'basic'),
    getKeyOnly(flowing, 'flowing'),
    getKeyOnly(inverted, 'inverted'),
    'popup transition visible',
    className,
  )
  const ElementType = getComponentType(props)

  const styles = {
    // Heads up! We need default styles to get working correctly `flowing`
    left: 'auto',
    right: 'auto',
    // This is required to be properly positioned inside wrapping `div`
    position: 'initial' as const,
    ...style,
  }

  const innerElement = (
    <ElementType {...contentRestProps} className={classes} style={styles} ref={elementRef}>
      {childrenUtils.isNil(children) ? (
        <>
          {PopupHeader.create(header, { autoGenerateKey: false })}
          {PopupContent.create(content, { autoGenerateKey: false })}
        </>
      ) : (
        children
      )}
    </ElementType>
  )

  // A wrapping `div` is required as SUI CSS defines margins on `.ui.popup` that would
  // interfere with positioning. This `div` is positioned by Floating UI instead.
  const popupContent = createHTMLDivision(popper || {}, {
    overrideProps: {
      children: innerElement,
      ref: refs.setFloating,
      style: {
        // Fixes layout for floated elements
        // https://github.com/Semantic-Org/Semantic-UI-React/issues/4092
        display: 'flex',
        ...floatingStyles,
      },
    },
  })

  const mergedPortalProps = { ...getPortalProps(props), ...portalRestProps }

  debug('portal props:', mergedPortalProps)

  return (
    <Portal
      {...mergedPortalProps}
      onClose={handleClose}
      onMount={handlePortalMount}
      onOpen={handleOpen}
      onUnmount={handlePortalUnmount}
      trigger={trigger}
      triggerRef={triggerRef}
      hideOnScroll={hideOnScroll}
    >
      {popupContent}
    </Portal>
  )
}

Popup.displayName = 'Popup'
Popup.handledProps = [
  'as',
  'basic',
  'children',
  'className',
  'content',
  'context',
  'disabled',
  'eventsEnabled',
  'flowing',
  'header',
  'hideOnScroll',
  'hoverable',
  'inverted',
  'offset',
  'onClose',
  'onMount',
  'onOpen',
  'onUnmount',
  'pinned',
  'position',
  'positionFixed',
  'popper',
  'popperModifiers',
  'popperDependencies',
  'size',
  'style',
  'trigger',
  'wide',
]

Popup.Content = PopupContent
Popup.Header = PopupHeader

export default Popup

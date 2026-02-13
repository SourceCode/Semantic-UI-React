import keyboardKey from 'keyboard-key'
import _ from 'lodash'
import * as React from 'react'

import {
  doesNodeContainClick,
  makeDebugger,
  useAutoControlledValue,
  useEventCallback,
  useMergedRefs,
} from '../../lib'
import useTrigger from './utils/useTrigger'
import PortalInner from './PortalInner'

const debug = makeDebugger('portal')

export interface StrictPortalProps {
  /** Primary content. */
  children?: React.ReactNode

  /** Controls whether or not the portal should close on a click outside. */
  closeOnDocumentClick?: boolean

  /** Controls whether or not the portal should close when escape is pressed is displayed. */
  closeOnEscape?: boolean

  /**
   * Controls whether or not the portal should close when mousing out of the portal.
   * NOTE: This will prevent `closeOnTriggerMouseLeave` when mousing over the
   * gap from the trigger to the portal.
   */
  closeOnPortalMouseLeave?: boolean

  /** Controls whether or not the portal should close on blur of the trigger. */
  closeOnTriggerBlur?: boolean

  /** Controls whether or not the portal should close on click of the trigger. */
  closeOnTriggerClick?: boolean

  /** Controls whether or not the portal should close when mousing out of the trigger. */
  closeOnTriggerMouseLeave?: boolean

  /** Initial value of open. */
  defaultOpen?: boolean

  /** Event pool namespace that is used to handle component events. */
  eventPool?: string

  /** Hide the Popup when scrolling the window. */
  hideOnScroll?: boolean

  /** The node where the portal should mount. */
  mountNode?: any

  /** Milliseconds to wait before opening on mouse over */
  mouseEnterDelay?: number

  /** Milliseconds to wait before closing on mouse leave */
  mouseLeaveDelay?: number

  /**
   * Called when a close event happens
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClose?: (event: React.MouseEvent<HTMLElement>, data: PortalProps) => void

  /**
   * Called when the portal is mounted on the DOM
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onMount?: (nothing: null, data: PortalProps) => void

  /**
   * Called when an open event happens
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onOpen?: (event: React.MouseEvent<HTMLElement>, data: PortalProps) => void

  /**
   * Called when the portal is unmounted from the DOM
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onUnmount?: (nothing: null, data: PortalProps) => void

  /** Controls whether or not the portal is displayed. */
  open?: boolean

  /** Controls whether or not the portal should open when the trigger is clicked. */
  openOnTriggerClick?: boolean

  /** Controls whether or not the portal should open on focus of the trigger. */
  openOnTriggerFocus?: boolean

  /** Controls whether or not the portal should open when mousing over the trigger. */
  openOnTriggerMouseEnter?: boolean

  /** Element to be rendered in-place where the portal is defined. */
  trigger?: React.ReactNode

  /** Called with a ref to the trigger node. */
  triggerRef?: React.Ref<any>
}

export interface PortalProps extends StrictPortalProps {
  [key: string]: any
}

/**
 * A component that allows you to render children outside their parent.
 * @see Modal
 * @see Popup
 * @see Dimmer
 * @see Confirm
 */
function Portal(props: PortalProps) {
  const {
    children,
    closeOnDocumentClick = true,
    closeOnEscape = true,
    closeOnPortalMouseLeave,
    closeOnTriggerBlur,
    closeOnTriggerClick,
    closeOnTriggerMouseLeave,
    mountNode,
    mouseEnterDelay,
    mouseLeaveDelay,
    openOnTriggerClick = true,
    openOnTriggerFocus,
    openOnTriggerMouseEnter,
    hideOnScroll = false,
  } = props

  const [open, setOpen] = useAutoControlledValue({
    state: props.open,
    defaultState: props.defaultOpen,
    initialState: false,
  })

  const contentRef = React.useRef<HTMLDivElement>(null)
  const trigger = useTrigger(props.trigger)

  // Internal ref for the trigger wrapper span, merged with user's triggerRef
  const internalTriggerRef = React.useRef<HTMLSpanElement>(null)
  const triggerRef = useMergedRefs(internalTriggerRef, props.triggerRef)

  const mouseEnterTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const mouseLeaveTimer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const latestDocumentMouseDownEvent = React.useRef<MouseEvent | null>(null)

  // ----------------------------------------
  // Behavior
  // ----------------------------------------

  const openPortal = (e: any) => {
    debug('open()')

    setOpen(true)
    _.invoke(props, 'onOpen', e, { ...props, open: true })
  }

  const openPortalWithTimeout = (e: any, delay?: number) => {
    debug('openWithTimeout()', delay)
    // React wipes the entire event object and suggests using e.persist() if
    // you need the event for async access. However, even with e.persist
    // certain required props (e.g. currentTarget) are null so we're forced to clone.
    const eventClone = { ...e }
    return setTimeout(() => openPortal(eventClone), delay || 0)
  }

  const closePortal = useEventCallback((e: any) => {
    debug('close()')

    setOpen(false)
    _.invoke(props, 'onClose', e, { ...props, open: false })
  })

  const closePortalWithTimeout = (e: any, delay?: number) => {
    debug('closeWithTimeout()', delay)
    // React wipes the entire event object and suggests using e.persist() if
    // you need the event for async access. However, even with e.persist
    // certain required props (e.g. currentTarget) are null so we're forced to clone.
    const eventClone = { ...e }
    return setTimeout(() => closePortal(eventClone), delay || 0)
  }

  // ----------------------------------------
  // Document Event Handlers
  // ----------------------------------------

  React.useEffect(() => {
    // Clean up timers
    return () => {
      clearTimeout(mouseEnterTimer.current)
      clearTimeout(mouseLeaveTimer.current)
    }
  }, [])

  const handleDocumentMouseDown = useEventCallback((e: MouseEvent) => {
    latestDocumentMouseDownEvent.current = e
  })

  const handleDocumentClick = useEventCallback((e: MouseEvent) => {
    const currentMouseDownEvent = latestDocumentMouseDownEvent.current
    latestDocumentMouseDownEvent.current = null

    // event happened in trigger (delegate to trigger handlers)
    const isInsideTrigger = doesNodeContainClick(internalTriggerRef.current, e)
    // event originated in the portal but was ended outside
    const isOriginatedFromPortal =
      currentMouseDownEvent && doesNodeContainClick(contentRef.current, currentMouseDownEvent)
    // event happened in the portal
    const isInsidePortal = doesNodeContainClick(contentRef.current, e)

    if (
      !contentRef.current?.contains || // no portal
      isInsideTrigger ||
      isOriginatedFromPortal ||
      isInsidePortal
    ) {
      return
    } // ignore the click

    if (closeOnDocumentClick) {
      debug('handleDocumentClick()')
      closePortal(e)
    }
  })

  const handleEscape = useEventCallback((e: KeyboardEvent) => {
    if (!closeOnEscape) {
      return
    }
    if (keyboardKey.getCode(e) !== keyboardKey.Escape) {
      return
    }

    debug('handleEscape()')
    closePortal(e)
  })

  // ----------------------------------------
  // Component Event Handlers
  // ----------------------------------------

  React.useEffect(() => {
    if (!hideOnScroll) {
      return
    }

    const handleScroll = (e: Event) => {
      debug('handleHideOnScroll()')

      // Do not hide the popup when scroll comes from inside the popup
      // https://github.com/Semantic-Org/Semantic-UI-React/issues/4305
      if (_.isElement(e.target) && contentRef.current?.contains(e.target as Node)) {
        return
      }

      closePortal(e)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [closePortal, hideOnScroll])

  const handlePortalMouseLeave = useEventCallback((e: MouseEvent) => {
    if (!closeOnPortalMouseLeave) {
      return
    }

    // Do not close the portal when 'mouseleave' is triggered by children
    if (e.target !== contentRef.current) {
      return
    }

    debug('handlePortalMouseLeave()')
    mouseLeaveTimer.current = closePortalWithTimeout(e, mouseLeaveDelay)
  })

  const handlePortalMouseEnter = useEventCallback(() => {
    // In order to enable mousing from the trigger to the portal, we need to
    // clear the mouseleave timer that was set when leaving the trigger.
    if (!closeOnPortalMouseLeave) {
      return
    }

    debug('handlePortalMouseEnter()')
    clearTimeout(mouseLeaveTimer.current)
  })

  // Replace EventStack with useEffect + addEventListener
  React.useEffect(() => {
    if (!open) return

    // contentRef-targeted events
    const node = contentRef.current
    if (node) {
      node.addEventListener('mouseleave', handlePortalMouseLeave)
      node.addEventListener('mouseenter', handlePortalMouseEnter)
    }

    // document-level events
    document.addEventListener('mousedown', handleDocumentMouseDown)
    document.addEventListener('click', handleDocumentClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      if (node) {
        node.removeEventListener('mouseleave', handlePortalMouseLeave)
        node.removeEventListener('mouseenter', handlePortalMouseEnter)
      }
      document.removeEventListener('mousedown', handleDocumentMouseDown)
      document.removeEventListener('click', handleDocumentClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  // Trigger event handlers. With the wrapper span approach, the trigger's own
  // event handlers fire naturally via event bubbling. These handlers on the
  // wrapper span only manage Portal-specific behavior (open/close logic).
  const handleTriggerBlur = (e: React.FocusEvent) => {
    const target = e.relatedTarget || document.activeElement
    // do not close if focus is given to the portal
    const didFocusPortal = _.invoke(contentRef.current, 'contains', target)

    if (!closeOnTriggerBlur || didFocusPortal) {
      return
    }

    debug('handleTriggerBlur()')
    closePortal(e)
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (open && closeOnTriggerClick) {
      debug('handleTriggerClick() - close')

      closePortal(e)
    } else if (!open && openOnTriggerClick) {
      debug('handleTriggerClick() - open')
      openPortal(e)
    }
  }

  const handleTriggerFocus = (e: React.FocusEvent) => {
    if (!openOnTriggerFocus) {
      return
    }

    debug('handleTriggerFocus()')
    openPortal(e)
  }

  const handleTriggerMouseLeave = (e: React.MouseEvent) => {
    clearTimeout(mouseEnterTimer.current)

    if (!closeOnTriggerMouseLeave) {
      return
    }

    debug('handleTriggerMouseLeave()')
    mouseLeaveTimer.current = closePortalWithTimeout(e, mouseLeaveDelay)
  }

  const handleTriggerMouseEnter = (e: React.MouseEvent) => {
    clearTimeout(mouseLeaveTimer.current)

    if (!openOnTriggerMouseEnter) {
      return
    }

    debug('handleTriggerMouseEnter()')
    mouseEnterTimer.current = openPortalWithTimeout(e, mouseEnterDelay)
  }

  return (
    <>
      {open && (
        <PortalInner
          mountNode={mountNode}
          onMount={() => _.invoke(props, 'onMount', null, props)}
          onUnmount={() => _.invoke(props, 'onUnmount', null, props)}
          ref={contentRef}
        >
          {children}
        </PortalInner>
      )}
      {trigger && (
        <span
          style={{ display: 'contents' }}
          onBlur={handleTriggerBlur}
          onClick={handleTriggerClick}
          onFocus={handleTriggerFocus}
          onMouseLeave={handleTriggerMouseLeave}
          onMouseEnter={handleTriggerMouseEnter}
          ref={triggerRef}
        >
          {trigger}
        </span>
      )}
    </>
  )
}

Portal.displayName = 'Portal'
Portal.handledProps = [
  'children',
  'closeOnDocumentClick',
  'closeOnEscape',
  'closeOnPortalMouseLeave',
  'closeOnTriggerBlur',
  'closeOnTriggerClick',
  'closeOnTriggerMouseLeave',
  'defaultOpen',
  'eventPool',
  'hideOnScroll',
  'mountNode',
  'mouseEnterDelay',
  'mouseLeaveDelay',
  'onClose',
  'onMount',
  'onOpen',
  'onUnmount',
  'open',
  'openOnTriggerClick',
  'openOnTriggerFocus',
  'openOnTriggerMouseEnter',
  'trigger',
  'triggerRef',
]

Portal.Inner = PortalInner

export default Portal

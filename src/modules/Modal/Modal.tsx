import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  doesNodeContainClick,
  getComponentType,
  getUnhandledProps,
  isBrowser,
  makeDebugger,
  getKeyOnly,
  useAutoControlledValue,
  useMergedRefs,
} from '../../lib'
import type { SemanticShorthandItem } from '../../generic'
import type { StrictPortalProps } from '../../addons/Portal'
import Icon from '../../elements/Icon'
import Portal from '../../addons/Portal'
import type { ModalActionsProps } from './ModalActions'
import ModalActions from './ModalActions'
import type { ModalContentProps } from './ModalContent'
import ModalContent from './ModalContent'
import ModalDescription from './ModalDescription'
import type { ModalDimmerProps } from './ModalDimmer'
import ModalDimmer from './ModalDimmer'
import type { ModalHeaderProps } from './ModalHeader'
import ModalHeader from './ModalHeader'
import { canFit } from './utils'

const debug = makeDebugger('modal')

export interface StrictModalProps extends StrictPortalProps {
  /** An element type to render as (string or function). */
  as?: any

  /** Shorthand for Modal.Actions. Typically an array of button shorthand. */
  actions?: SemanticShorthandItem<ModalActionsProps>

  /** A Modal can reduce its complexity */
  basic?: boolean

  /** A modal can be vertically centered in the viewport. */
  centered?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Icon. */
  closeIcon?: any

  /** Whether or not the Modal should close when the dimmer is clicked. */
  closeOnDimmerClick?: boolean

  /** Whether or not the Modal should close when the document is clicked. */
  closeOnDocumentClick?: boolean

  /** A Modal can be passed content via shorthand. */
  content?: SemanticShorthandItem<ModalContentProps>

  /** Initial value of open. */
  defaultOpen?: boolean

  /** A modal can appear in a dimmer. */
  dimmer?: true | 'blurring' | 'inverted' | SemanticShorthandItem<ModalDimmerProps>

  /** Event pool namespace that is used to handle component events */
  eventPool?: string

  /** A Modal can be passed header via shorthand. */
  header?: SemanticShorthandItem<ModalHeaderProps>

  /** The node where the modal should mount. Defaults to document.body. */
  mountNode?: any

  /**
   * Action onClick handler when using shorthand `actions`.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onActionClick?: (event: React.MouseEvent<HTMLElement>, data: ModalProps) => void

  /**
   * Called when a close event happens.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClose?: (event: React.MouseEvent<HTMLElement>, data: ModalProps) => void

  /**
   * Called when the portal is mounted on the DOM.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onMount?: (nothing: null, data: ModalProps) => void

  /**
   * Called when an open event happens.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onOpen?: (event: React.MouseEvent<HTMLElement>, data: ModalProps) => void

  /**
   * Called when the portal is unmounted from the DOM.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onUnmount?: (nothing: null, data: ModalProps) => void

  /** Controls whether or not the Modal is displayed. */
  open?: boolean

  /** A modal can vary in size. */
  size?: 'mini' | 'tiny' | 'small' | 'large' | 'fullscreen'

  /** Custom styles. */
  style?: React.CSSProperties

  /** Element to be rendered in-place where the portal is defined. */
  trigger?: React.ReactNode
}

export interface ModalProps extends StrictModalProps {
  [key: string]: any
}

/**
 * A modal displays content that temporarily blocks interactions with the main view of a site.
 * @see Confirm
 * @see Portal
 */
function Modal({ ref, ...props }: ModalProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    actions,
    basic,
    centered = true,
    children,
    className,
    closeIcon,
    closeOnDimmerClick = true,
    closeOnDocumentClick = false,
    content,
    dimmer = true,
    eventPool = 'Modal',
    header,
    size,
    style,
    trigger,
  } = props
  // Do not access document when server side rendering
  const mountNode = isBrowser() ? props.mountNode || document.body : null

  const [open, setOpen] = useAutoControlledValue({
    state: props.open,
    defaultState: props.defaultOpen,
    initialState: false,
  })

  const [scrolling, setScrolling] = React.useState(false)

  const elementRef = useMergedRefs(ref, React.useRef<HTMLDivElement>(null))
  const dimmerRef = React.useRef<HTMLDivElement>(null)

  const animationRequestId = React.useRef<number | undefined>(undefined)
  const latestDocumentMouseDownEvent = React.useRef<MouseEvent | null>(null)

  React.useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRequestId.current!)
      latestDocumentMouseDownEvent.current = null
    }
  }, [])

  // ----------------------------------------
  // Styles calc
  // ----------------------------------------

  const setPositionAndClassNames = () => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      const isFitted = canFit(rect)

      setScrolling(!isFitted)
    }

    animationRequestId.current = requestAnimationFrame(setPositionAndClassNames)
  }

  // ----------------------------------------
  // Document Event Handlers
  // ----------------------------------------

  const handleClose = (e: React.MouseEvent<HTMLElement> | MouseEvent) => {
    debug('close()')

    setOpen(false)
    _.invoke(props, 'onClose', e, { ...props, open: false })
  }

  const handleDocumentMouseDown = (e: MouseEvent) => {
    latestDocumentMouseDownEvent.current = e
  }

  const handleDocumentClick = (e: MouseEvent) => {
    debug('handleDocumentClick()')

    const currentDocumentMouseDownEvent = latestDocumentMouseDownEvent.current
    latestDocumentMouseDownEvent.current = null

    if (
      !closeOnDimmerClick ||
      doesNodeContainClick(elementRef.current, currentDocumentMouseDownEvent) ||
      doesNodeContainClick(elementRef.current, e)
    )
      return

    setOpen(false)
    _.invoke(props, 'onClose', e, { ...props, open: false })
  }

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    debug('open()')

    setOpen(true)
    _.invoke(props, 'onOpen', e, { ...props, open: true })
  }

  const handlePortalMount = (e: null) => {
    debug('handlePortalMount()', { eventPool })

    setScrolling(false)
    setPositionAndClassNames()

    if (dimmerRef.current) {
      dimmerRef.current.addEventListener('mousedown', handleDocumentMouseDown)
      dimmerRef.current.addEventListener('click', handleDocumentClick)
    }
    _.invoke(props, 'onMount', e, props)
  }

  const handlePortalUnmount = (e: null) => {
    debug('handlePortalUnmount()', { eventPool })

    cancelAnimationFrame(animationRequestId.current!)
    if (dimmerRef.current) {
      dimmerRef.current.removeEventListener('mousedown', handleDocumentMouseDown)
      dimmerRef.current.removeEventListener('click', handleDocumentClick)
    }
    _.invoke(props, 'onUnmount', e, props)
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------

  const renderContent = (rest: Record<string, any>) => {
    const classes = cx(
      'ui',
      size,
      getKeyOnly(basic, 'basic'),
      getKeyOnly(scrolling, 'scrolling'),
      'modal transition visible active',
      className,
    )
    const ElementType = getComponentType(props)

    const closeIconName = closeIcon === true ? 'close' : closeIcon
    const closeIconJSX = Icon.create(closeIconName, {
      overrideProps: (predefinedProps: any) => ({
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          _.invoke(predefinedProps, 'onClick', e)
          handleClose(e)
        },
      }),
    })

    return (
      <ElementType
        {...rest}
        className={classes}
        ref={elementRef}
        style={style}
      >
        {closeIconJSX}
        {childrenUtils.isNil(children) ? (
          <>
            {ModalHeader.create(header, { autoGenerateKey: false })}
            {ModalContent.create(content, { autoGenerateKey: false })}
            {ModalActions.create(actions, {
              overrideProps: (predefinedProps: any) => ({
                onActionClick: (e: React.MouseEvent<HTMLElement>, actionProps: any) => {
                  _.invoke(predefinedProps, 'onActionClick', e, actionProps)
                  _.invoke(props, 'onActionClick', e, props)

                  handleClose(e)
                },
              }),
            })}
          </>
        ) : (
          children
        )}
      </ElementType>
    )
  }

  // Short circuit when server side rendering
  if (!isBrowser()) {
    return React.isValidElement(trigger) ? trigger : null
  }

  const unhandled = getUnhandledProps(Modal, props)
  const portalPropNames = (Portal as any).handledProps

  const rest = _.reduce(
    unhandled,
    (acc: Record<string, any>, val: any, key: string) => {
      if (!_.includes(portalPropNames, key)) acc[key] = val

      return acc
    },
    {},
  )
  const portalProps = _.pick(unhandled, portalPropNames)

  // Heads up!
  //
  // The SUI CSS selector to prevent the modal itself from blurring requires an immediate .dimmer child:
  // .blurring.dimmed.dimmable>:not(.dimmer) { ... }
  //
  // The .blurring.dimmed.dimmable is the body, so that all body content inside is blurred.
  // We need the immediate child to be the dimmer to :not() blur the modal itself!
  // Otherwise, the portal div is also blurred, blurring the modal.
  //
  // We cannot them wrap the modalJSX in an actual <Dimmer /> instead, we apply the dimmer classes to the <Portal />.

  return (
    <Portal
      closeOnDocumentClick={closeOnDocumentClick}
      {...portalProps}
      trigger={trigger}
      eventPool={eventPool}
      mountNode={mountNode}
      open={open}
      onClose={handleClose}
      onMount={handlePortalMount}
      onOpen={handleOpen}
      onUnmount={handlePortalUnmount}
    >
      {ModalDimmer.create(_.isPlainObject(dimmer) ? dimmer : {}, {
        autoGenerateKey: false,
        defaultProps: {
          blurring: dimmer === 'blurring',
          inverted: dimmer === 'inverted',
        },
        overrideProps: {
          children: renderContent(rest),
          centered,
          mountNode,
          scrolling,
          ref: dimmerRef,
        },
      })}
    </Portal>
  )
}

Modal.displayName = 'Modal'
Modal.handledProps = [
  'as',
  'actions',
  'basic',
  'centered',
  'children',
  'className',
  'closeIcon',
  'closeOnDimmerClick',
  'closeOnDocumentClick',
  'content',
  'defaultOpen',
  'dimmer',
  'eventPool',
  'header',
  'mountNode',
  'onActionClick',
  'onClose',
  'onMount',
  'onOpen',
  'onUnmount',
  'open',
  'size',
  'style',
  'trigger',
]

Modal.Actions = ModalActions
Modal.Content = ModalContent
Modal.Description = ModalDescription
Modal.Dimmer = ModalDimmer
Modal.Header = ModalHeader

export default Modal

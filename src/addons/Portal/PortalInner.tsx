import _ from 'lodash'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { isBrowser, makeDebugger, useEventCallback } from '../../lib'
import usePortalElement from './usePortalElement'

const debug = makeDebugger('PortalInner')

export interface StrictPortalInnerProps {
  /** Primary content. */
  children: React.ReactNode

  /** The node where the portal should mount. */
  mountNode?: any

  /**
   * Called when the PortalInner is mounted on the DOM.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onMount?: (nothing: null, data: PortalInnerProps) => void

  /**
   * Called when the PortalInner is unmounted from the DOM.
   *
   * @param {null}
   * @param {object} data - All props.
   */
  onUnmount?: (nothing: null, data: PortalInnerProps) => void
}

export interface PortalInnerProps extends StrictPortalInnerProps {
  [key: string]: any
}

/**
 * An inner component that allows you to render children outside their parent.
 */
function PortalInner({ ref, ...props }: PortalInnerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const handleMount = useEventCallback(() => _.invoke(props, 'onMount', null, props))
  const handleUnmount = useEventCallback(() => _.invoke(props, 'onUnmount', null, props))

  const element = usePortalElement(props.children, ref)

  React.useEffect(() => {
    debug('componentDidMount()')
    handleMount()

    return () => {
      debug('componentWillUnmount()')
      handleUnmount()
    }
  }, [])

  if (!isBrowser()) {
    return null
  }

  return createPortal(element, props.mountNode || document.body)
}

PortalInner.displayName = 'PortalInner'
PortalInner.handledProps = [
  'children',
  'mountNode',
  'onMount',
  'onUnmount',
]

export default PortalInner

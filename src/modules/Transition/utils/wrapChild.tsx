import * as React from 'react'

import Transition from '../Transition'
import type { TransitionEventData } from '../Transition'

interface WrapChildOptions {
  animation?: string
  duration?: number | string | { hide: number; show: number }
  directional?: boolean
  transitionOnMount?: boolean
  visible?: boolean
}

/**
 * Wraps a React element with a Transition component.
 *
 * @param {React.ReactElement} child
 * @param {Function} onHide
 * @param {Object} [options={}]
 * @param {String} [options.animation]
 * @param {Number} [options.duration]
 * @param {Boolean} [options.directional]
 * @param {Boolean} [options.transitionOnMount=false]
 * @param {Boolean} [options.visible=true]
 */
export default function wrapChild(
  child: React.ReactElement<any>,
  onHide: (nothing: null, data: TransitionEventData) => void,
  options: WrapChildOptions = {},
) {
  const { key } = child
  const { animation, directional, duration, transitionOnMount = false, visible = true } = options

  return (
    <Transition
      animation={animation}
      directional={directional}
      duration={duration}
      key={key}
      onHide={onHide}
      reactKey={key ?? undefined}
      transitionOnMount={transitionOnMount}
      visible={visible}
    >
      {child}
    </Transition>
  )
}

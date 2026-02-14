/**
 * DOM Event utilities for dispatching native DOM events in tests.
 * Replaces simulant with native DOM event creation.
 *
 * Events are wrapped in React's act() to ensure state updates are flushed.
 *
 * For user-level interactions (click, type, etc.), prefer
 * @testing-library/user-event instead of these low-level helpers.
 */

import { act } from 'react'

// Map event types to their proper Event constructor
const eventConstructors = {
  click: MouseEvent,
  mousedown: MouseEvent,
  mouseup: MouseEvent,
  mouseover: MouseEvent,
  mouseenter: MouseEvent,
  mouseleave: MouseEvent,
  keydown: KeyboardEvent,
  keyup: KeyboardEvent,
  keypress: KeyboardEvent,
  focus: FocusEvent,
  blur: FocusEvent,
  scroll: Event,
  resize: Event,
}

/**
 * Generic method for dispatching an event on a DOM node.
 * @param {String|HTMLElement} node A querySelector string or DOM node.
 * @param {String} eventType A DOMString
 * @param {Object} [data] Additional event data.
 * @returns {Event} The event
 */
export const fire = (node, eventType, data = {}) => {
  const DOMNode = typeof node === 'string' ? document.querySelector(node) : node

  const EventConstructor = eventConstructors[eventType] || Event
  const event = new EventConstructor(eventType, { bubbles: true, cancelable: true, ...data })

  // For properties that can't be set via constructor (e.g., custom data),
  // try to define them. Skip read-only properties that are already set by the constructor.
  Object.keys(data).forEach((key) => {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(event, key) ||
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(event), key)
      if (!descriptor || descriptor.writable || descriptor.set) {
        event[key] = data[key]
      }
    } catch {
      // Skip read-only properties
    }
  })

  act(() => {
    DOMNode.dispatchEvent(event)
  })
  return event
}

export const click = (node, data) => fire(node, 'click', data)
export const keyDown = (node, data) => fire(node, 'keydown', data)
export const mouseDown = (node, data) => fire(node, 'mousedown', data)
export const mouseEnter = (node, data) => fire(node, 'mouseenter', { ...data, bubbles: false })
export const mouseLeave = (node, data) => fire(node, 'mouseleave', { ...data, bubbles: false })
export const mouseOver = (node, data) => fire(node, 'mouseover', data)
export const mouseUp = (node, data) => fire(node, 'mouseup', data)
export const resize = (node, data) => fire(node, 'resize', data)
export const scroll = (node, data) => fire(node, 'scroll', data)

export default {
  fire,
  click,
  keyDown,
  mouseEnter,
  mouseLeave,
  mouseOver,
  mouseDown,
  mouseUp,
  resize,
  scroll,
}

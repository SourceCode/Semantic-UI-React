/**
 * DOM Event utilities for dispatching native DOM events in tests.
 * Replaces simulant with native DOM event creation.
 *
 * For user-level interactions (click, type, etc.), prefer
 * @testing-library/user-event instead of these low-level helpers.
 */

/**
 * Generic method for dispatching an event on a DOM node.
 * @param {String|HTMLElement} node A querySelector string or DOM node.
 * @param {String} eventType A DOMString
 * @param {Object} [data] Additional event data.
 * @returns {Event} The event
 */
export const fire = (node, eventType, data = {}) => {
  const DOMNode = typeof node === 'string' ? document.querySelector(node) : node

  const event = new Event(eventType, { bubbles: true, cancelable: true, ...data })
  Object.assign(event, data)

  DOMNode.dispatchEvent(event)
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

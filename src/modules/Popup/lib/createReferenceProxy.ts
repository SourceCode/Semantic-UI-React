import _ from 'lodash'
import { isRefObject } from '../../../lib'

class ReferenceProxy {
  ref: React.RefObject<any> | { current: any }

  constructor(refObject: React.RefObject<any> | { current: any }) {
    this.ref = refObject
  }

  getBoundingClientRect(): DOMRect | Record<string, never> {
    return _.invoke(this.ref.current, 'getBoundingClientRect') || {}
  }

  get clientWidth(): number | undefined {
    return (this.getBoundingClientRect() as DOMRect).width
  }

  get clientHeight(): number | undefined {
    return (this.getBoundingClientRect() as DOMRect).height
  }

  get parentNode(): (Node & ParentNode) | null | undefined {
    return this.ref.current ? this.ref.current.parentNode : undefined
  }

  get contextElement(): Element | undefined {
    return this.ref.current
  }
}

/**
 * Popper.js does not support ref objects from `createRef()` as referenceElement. If we will pass
 * directly `ref`, `ref.current` will be `null` at the render process. We use memoize to keep the
 * same reference between renders.
 *
 * @see https://popper.js.org/popper-documentation.html#referenceObject
 */
const createReferenceProxy = _.memoize(
  (reference: any) => new ReferenceProxy(isRefObject(reference) ? reference : { current: reference }),
)

export default createReferenceProxy

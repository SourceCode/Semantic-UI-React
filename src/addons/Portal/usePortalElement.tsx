import * as React from 'react'

/**
 * Wraps a React node in a container div with a ref for portal tracking.
 *
 * In React 19, ref is a regular prop on all elements, so the previous approach
 * of cloning elements to inject refs is no longer necessary. We always wrap in
 * a container div, which also serves as a reliable ref target for
 * doesNodeContainClick checks in Portal.
 *
 * @param {React.ReactNode} node
 * @param {React.Ref} ref
 */
export default function usePortalElement(
  node: React.ReactNode,
  ref?: React.Ref<HTMLDivElement>,
): React.ReactElement {
  return (
    <div data-suir-portal='true' ref={ref}>
      {node}
    </div>
  )
}

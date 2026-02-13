import * as React from 'react'

import { createShorthandFactory, getUnhandledProps, isBrowser } from '../../lib'
import Portal from '../../addons/Portal'
import DimmerDimmable from './DimmerDimmable'
import DimmerInner from './DimmerInner'

export interface StrictDimmerProps {
  /** An active dimmer will dim its parent container. */
  active?: boolean

  /** A dimmer can be formatted to be fixed to the page. */
  page?: boolean
}

export interface DimmerProps extends StrictDimmerProps {
  [key: string]: any
}

/**
 * A dimmer hides distractions to focus attention on particular content.
 */
function Dimmer({ ref, ...props }: DimmerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { active, page } = props
  const rest = getUnhandledProps(Dimmer, props)

  if (page) {
    const handlePortalMount = () => {
      if (!isBrowser()) {
        return
      }

      // Heads up, IE doesn't support second argument in add()
      document.body.classList.add('dimmed')
      document.body.classList.add('dimmable')
    }

    const handlePortalUnmount = () => {
      if (!isBrowser()) {
        return
      }

      // Heads up, IE doesn't support second argument in add()
      document.body.classList.remove('dimmed')
      document.body.classList.remove('dimmable')
    }

    return (
      <Portal
        closeOnEscape={false}
        closeOnDocumentClick={false}
        onMount={handlePortalMount}
        onUnmount={handlePortalUnmount}
        open={active}
        openOnTriggerClick={false}
      >
        <DimmerInner {...rest} active={active} page={page} ref={ref} />
      </Portal>
    )
  }

  return <DimmerInner {...rest} active={active} page={page} ref={ref} />
}

Dimmer.displayName = 'Dimmer'
Dimmer.handledProps = [
  'active',
  'page',
]

Dimmer.Dimmable = DimmerDimmable
Dimmer.Inner = DimmerInner

Dimmer.create = createShorthandFactory(Dimmer, (value) => ({ content: value }))

export default Dimmer

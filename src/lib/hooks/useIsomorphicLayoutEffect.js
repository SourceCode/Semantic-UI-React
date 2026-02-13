import * as React from 'react'
import isBrowser from '../isBrowser'

// useLayoutEffect() produces a warning with SSR rendering
// https://medium.com/@alexandereardon/uselayouteffect-and-ssr-192986cdcf7a
const useIsomorphicLayoutEffect = isBrowser() ? React.useLayoutEffect : React.useEffect

export default useIsomorphicLayoutEffect

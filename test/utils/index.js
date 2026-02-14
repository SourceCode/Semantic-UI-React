export * from './assertNodeContains'
export { default as assertWithTimeout } from './assertWithTimeout'
export { default as consoleUtil } from './consoleUtil'
export { default as domEvent } from './domEvent'
export { default as getComponentName } from './getComponentName'
export { default as getComponentProps } from './getComponentProps'
export { default as syntheticEvent } from './syntheticEvent'

/**
 * Flush pending React useEffect callbacks that may be deferred.
 * Useful when tests need event listeners that are set up in useEffect.
 */
export const flushEffects = () => new Promise((resolve) => setTimeout(resolve, 0))

export const sandbox = {
  spy: (...args) => (args.length >= 2 ? vi.spyOn(args[0], args[1]) : vi.fn()),
  stub: (...args) =>
    args.length >= 2
      ? vi.spyOn(args[0], args[1]).mockImplementation(() => {})
      : vi.fn(),
}

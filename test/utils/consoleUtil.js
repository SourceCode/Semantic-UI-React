/**
 * Console utility for temporarily silencing console output in tests.
 * Uses Vitest's vi.spyOn to mock console methods.
 */

const noop = () => undefined

/**
 * Silence the console for the current test.
 * Console methods are replaced with no-ops.
 * Vitest's restoreMocks config will auto-restore after each test.
 */
const disableOnce = () => {
  vi.spyOn(console, 'log').mockImplementation(noop)
  vi.spyOn(console, 'info').mockImplementation(noop)
  vi.spyOn(console, 'warn').mockImplementation(noop)
  vi.spyOn(console, 'error').mockImplementation(noop)
}

export default {
  disableOnce,
}

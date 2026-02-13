/**
 * Test Setup
 * This is the bootstrap code that is run before any tests.
 * Configures @testing-library/jest-dom matchers and console override pattern.
 */
import '@testing-library/jest-dom/vitest'

// ----------------------------------------
// Console
// ----------------------------------------
// Fail on all console activity to catch unexpected warnings/errors.
let log
let info
let warn
let error

const throwOnConsole = (method) => (...args) => {
  throw new Error(
    `console.${method} should never be called but was called with:\n${args.join(' ')}`,
  )
}

/* eslint-disable no-console */
beforeEach(() => {
  log = console.log
  info = console.info
  warn = console.warn
  error = console.error

  console.log = throwOnConsole('log')
  console.info = throwOnConsole('info')
  console.warn = throwOnConsole('warn')
  console.error = throwOnConsole('error')
})
afterEach(() => {
  console.log = log
  console.info = info
  console.warn = warn
  console.error = error
})
/* eslint-enable no-console */

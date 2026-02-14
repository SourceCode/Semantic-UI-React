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
  if (method === 'error' && typeof args[0] === 'string') {
    // DOM nesting warnings from rendersChildren common tests (e.g. <div> inside <tbody>).
    // These are expected when testing that arbitrary children render.
    if (args[0].includes('cannot be a child of') || args[0].includes('text nodes cannot be a child') || args[0].includes('cannot contain a nested')) return
    // React concurrent rendering recovery errors from DOM nesting issues
    if (args[0].includes('error during concurrent rendering but React was able to recover')) return
  }
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

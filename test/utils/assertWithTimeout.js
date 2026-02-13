import { waitFor } from '@testing-library/react'

/**
 * Repeatedly attempt to make an assertion over a period of time.
 * If the assertion never passes, it will eventually throw.
 * Good for tests with unknown or unreliable execution times.
 *
 * Wraps RTL's waitFor for a consistent API.
 *
 * @param {function} assertion - A callback that makes test assertions.
 * @param {object} [options] - Options passed to waitFor.
 * @param {number} [options.timeout=1000] - Maximum wait time in ms.
 * @param {number} [options.interval=10] - Polling interval in ms.
 * @returns {Promise}
 */
const assertWithTimeout = (assertion, options = {}) => {
  return waitFor(assertion, {
    timeout: options.timeout ?? 1000,
    interval: options.interval ?? 10,
    ...options,
  })
}

export default assertWithTimeout

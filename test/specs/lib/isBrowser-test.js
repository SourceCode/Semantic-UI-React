import isBrowser from 'src/lib/isBrowser'

describe('isBrowser', () => {
  describe('browser', () => {
    it('should return true in a browser', () => {
      // tests are run in a browser-like environment (jsdom), this should be true
      expect(isBrowser()).toBe(true)
    })
  })

  describe('server-side', () => {
    beforeAll(() => {
      isBrowser.override = false
    })

    afterAll(() => {
      isBrowser.override = null
    })

    it('should return override value', () => {
      // tests are run in a browser, this should be true
      expect(isBrowser()).toBe(false)
    })
  })
})

import * as ReactDOM from 'react-dom'

export interface PreloadStylesOptions {
  href?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export interface PreinitStylesOptions {
  href: string
  precedence?: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

export interface PreloadIconFontOptions {
  href: string
  crossOrigin?: '' | 'anonymous' | 'use-credentials'
}

/**
 * Preload the Semantic UI React CSS bundle.
 * Call this early in your application (e.g., in the root component or entry point)
 * to start loading CSS before components render.
 *
 * @param {PreloadStylesOptions} [options]
 */
export function preloadStyles(options: PreloadStylesOptions = {}) {
  const { href, crossOrigin } = options

  if (href) {
    ReactDOM.preload(href, { as: 'style', crossOrigin })
  }
}

/**
 * Eagerly load and apply the Semantic UI React CSS bundle.
 * Unlike preloadStyles, this immediately applies the stylesheet.
 *
 * @param {PreinitStylesOptions} [options]
 */
export function preinitStyles(options: PreinitStylesOptions = {} as PreinitStylesOptions) {
  const { href, precedence = 'default', crossOrigin } = options

  if (href) {
    ReactDOM.preinit(href, { as: 'style', precedence, crossOrigin })
  }
}

/**
 * Preload the icon font files (Font Awesome 5 Free WOFF2).
 * Call this to start loading icon fonts before Icon components render.
 *
 * @param {PreloadIconFontOptions} [options]
 */
export function preloadIconFont(options: PreloadIconFontOptions = {} as PreloadIconFontOptions) {
  const { href, crossOrigin = 'anonymous' } = options

  if (href) {
    ReactDOM.preload(href, { as: 'font', type: 'font/woff2', crossOrigin })
  }
}

/**
 * Prefetch DNS for CDN domains used by Semantic UI assets.
 *
 * @param {string} domain - Domain to prefetch DNS for (e.g., 'https://cdn.example.com')
 */
export function prefetchAssetDNS(domain: string) {
  ReactDOM.prefetchDNS(domain)
}

/**
 * Preconnect to CDN domains for Semantic UI assets.
 *
 * @param {string} domain - Domain to preconnect to.
 * @param {Object} [options]
 * @param {string} [options.crossOrigin] - CORS mode.
 */
export function preconnectAssets(
  domain: string,
  options: { crossOrigin?: '' | 'anonymous' | 'use-credentials' } = {},
) {
  ReactDOM.preconnect(domain, options)
}

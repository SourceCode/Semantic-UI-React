import * as React from 'react'

export interface StrictStylesheetLinkProps {
  /** URL of the CSS file to load. */
  href: string

  /**
   * Stylesheet precedence for ordering in the document head.
   * React 19 uses this to determine stylesheet insertion order.
   * @default 'default'
   */
  precedence?: string

  /** CORS mode for the stylesheet request. */
  crossOrigin?: '' | 'anonymous' | 'use-credentials'

  /** Media query for conditional stylesheet loading. */
  media?: string
}

export interface StylesheetLinkProps extends StrictStylesheetLinkProps {
  [key: string]: any
}

/**
 * StylesheetLink renders a <link rel="stylesheet"> element that React 19 hoists to <head>.
 * It supports the precedence prop for stylesheet ordering.
 *
 * Use this component to declaratively load Semantic UI React CSS within your component tree.
 * React 19 ensures the stylesheet is loaded before rendering dependent content.
 *
 * @example
 * // Load the full CSS bundle
 * <StylesheetLink href="/node_modules/semantic-ui-react/dist/styles/semantic-ui-react.css" />
 *
 * @example
 * // Load only button CSS with high precedence
 * <StylesheetLink
 *   href="/node_modules/semantic-ui-react/dist/styles/elements/button.css"
 *   precedence="high"
 * />
 */
function StylesheetLink({
  ref,
  ...props
}: StylesheetLinkProps & { ref?: React.Ref<HTMLLinkElement> }) {
  const { href, precedence = 'default', crossOrigin, media, ...rest } = props

  return (
    <link
      {...rest}
      ref={ref}
      rel='stylesheet'
      href={href}
      precedence={precedence}
      crossOrigin={crossOrigin}
      media={media}
    />
  )
}

StylesheetLink.displayName = 'StylesheetLink'
StylesheetLink.handledProps = ['href', 'precedence', 'crossOrigin', 'media']

export default StylesheetLink

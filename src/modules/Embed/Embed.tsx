import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createHTMLIframe,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  useAutoControlledValue,
} from '../../lib'
import type {
  HtmlIframeProps,
  SemanticShorthandContent,
  SemanticShorthandItem,
} from '../../generic'
import type { IconProps } from '../../elements/Icon'
import Icon from '../../elements/Icon'

export interface StrictEmbedProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** An embed can be active. */
  active?: boolean

  /** An embed can specify an alternative aspect ratio. */
  aspectRatio?: '4:3' | '16:9' | '21:9'

  /** Setting to true or false will force autoplay. */
  autoplay?: boolean

  /** Whether to show networks branded UI like title cards, or after video calls to action. */
  brandedUI?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** Specifies a default chrome color with Vimeo or YouTube. */
  color?: string

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** Initial value of active. */
  defaultActive?: boolean

  /** Whether to prefer HD content. */
  hd?: boolean

  /** Specifies an icon to use with placeholder content. */
  icon?: SemanticShorthandItem<IconProps>

  /** Specifies an id for source. */
  id?: string

  /** Shorthand for HTML iframe. */
  iframe?: SemanticShorthandItem<HtmlIframeProps>

  /**
   * Called on click.
   *
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props and proposed value.
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>, data: EmbedProps) => void

  /** A placeholder image for embed. */
  placeholder?: string

  /** Specifies a source to use. */
  source?: 'youtube' | 'vimeo'

  /** Specifies a url to use for embed. */
  url?: string
}

export interface EmbedProps extends StrictEmbedProps {
  [key: string]: any
}

/**
 * An embed displays content from other websites like YouTube videos or Google Maps.
 */
function Embed({ ref, ...props }: EmbedProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    aspectRatio,
    autoplay = true,
    brandedUI = false,
    children,
    className,
    color = '#444444',
    content,
    hd = true,
    icon,
    id,
    iframe,
    placeholder,
    source,
    url,
  } = props
  const [active, setActive] = useAutoControlledValue({
    state: props.active,
    defaultState: props.defaultActive,
    initialState: false,
  })

  const getSrc = () => {
    if (source === 'youtube') {
      return [
        `//www.youtube.com/embed/${id}`,
        '?autohide=true',
        `&amp;autoplay=${autoplay}`,
        `&amp;color=${encodeURIComponent(color)}`,
        `&amp;hq=${hd}`,
        '&amp;jsapi=false',
        `&amp;modestbranding=${brandedUI}`,
        `&amp;rel=${brandedUI ? 0 : 1}`,
      ].join('')
    }

    if (source === 'vimeo') {
      return [
        `//player.vimeo.com/video/${id}`,
        '?api=false',
        `&amp;autoplay=${autoplay}`,
        '&amp;byline=false',
        `&amp;color=${encodeURIComponent(color)}`,
        '&amp;portrait=false',
        '&amp;title=false',
      ].join('')
    }

    return url
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    _.invoke(props, 'onClick', e, { ...props, active: true })
    if (!active) {
      setActive(true)
    }
  }

  const renderEmbed = () => {
    if (!active) {
      return null
    }

    if (!childrenUtils.isNil(children)) {
      return <div className='embed'>{children}</div>
    }

    if (!childrenUtils.isNil(content)) {
      return <div className='embed'>{content}</div>
    }

    return (
      <div className='embed'>
        {createHTMLIframe(childrenUtils.isNil(iframe) ? getSrc() : iframe, {
          defaultProps: {
            allowFullScreen: false,
            frameBorder: 0,
            height: '100%',
            scrolling: 'no',
            src: getSrc(),
            title: `Embedded content from ${source}.`,
            width: '100%',
          },
          autoGenerateKey: false,
        })}
      </div>
    )
  }

  const classes = cx('ui', aspectRatio, getKeyOnly(active, 'active'), 'embed', className)
  const rest = getUnhandledProps(Embed, props)
  const ElementType = getComponentType(props)

  const iconShorthand = icon !== undefined ? icon : 'video play'

  return (
    <ElementType {...rest} className={classes} onClick={handleClick} ref={ref}>
      {Icon.create(iconShorthand, { autoGenerateKey: false })}
      {placeholder && <img className='placeholder' src={placeholder} />}
      {renderEmbed()}
    </ElementType>
  )
}

Embed.displayName = 'Embed'
Embed.handledProps = [
  'as',
  'active',
  'aspectRatio',
  'autoplay',
  'brandedUI',
  'children',
  'className',
  'color',
  'content',
  'defaultActive',
  'hd',
  'icon',
  'id',
  'iframe',
  'onClick',
  'placeholder',
  'source',
  'url',
]

export default Embed

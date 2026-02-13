import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createShorthandFactory,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  useEventCallback,
} from '../../lib'
import type { SemanticShorthandContent, SemanticShorthandItem } from '../../generic'
import type { IconProps } from '../Icon'
import Icon from '../Icon'
import type { StepDescriptionProps } from './StepDescription'
import type { StepTitleProps } from './StepTitle'
import StepContent from './StepContent'
import StepDescription from './StepDescription'
import StepGroup from './StepGroup'
import StepTitle from './StepTitle'

export interface StrictStepProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType
  /** A step can be highlighted as active. */
  active?: boolean
  /** Primary content. */
  children?: React.ReactNode
  /** Additional classes. */
  className?: string
  /** A step can show that a user has completed it. */
  completed?: boolean
  /** Shorthand for primary content. */
  content?: SemanticShorthandContent
  /** Shorthand for StepDescription. */
  description?: SemanticShorthandItem<StepDescriptionProps>
  /** Show that the Loader is inactive. */
  disabled?: boolean
  /** Render as an `a` tag instead of a `div` and adds the href attribute. */
  href?: string
  /** Shorthand for Icon. */
  icon?: SemanticShorthandItem<IconProps>
  /** A step can be link. */
  link?: boolean
  /**
   * Called on click. When passed, the component will render as an `a`
   * tag by default instead of a `div`.
   * @param {SyntheticEvent} event - React's original SyntheticEvent.
   * @param {object} data - All props.
   */
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>, data: StepProps) => void
  /** A step can show a ordered sequence of steps. Passed from StepGroup. */
  ordered?: boolean
  /** Shorthand for StepTitle. */
  title?: SemanticShorthandItem<StepTitleProps>
}

export interface StepProps extends StrictStepProps {
  [key: string]: any
}

/**
 * A step shows the completion status of an activity in a series of activities.
 */
function Step({ ref, ...props }: StepProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active,
    children,
    className,
    completed,
    content,
    description,
    disabled,
    href,
    onClick,
    icon,
    link,
    title,
  } = props

  const handleClick = useEventCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!disabled) {
      _.invoke(props, 'onClick', e, props)
    }
  })

  const classes = cx(
    getKeyOnly(active, 'active'),
    getKeyOnly(completed, 'completed'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(link, 'link'),
    'step',
    className,
  )

  const rest = getUnhandledProps(Step, props)
  const ElementType = getComponentType(props, {
    getDefault: () => {
      if (onClick) {
        return 'a'
      }

      return undefined
    },
  })

  if (!childrenUtils.isNil(children)) {
    return (
      <ElementType {...rest} className={classes} href={href} onClick={handleClick} ref={ref}>
        {children}
      </ElementType>
    )
  }

  if (!childrenUtils.isNil(content)) {
    return (
      <ElementType {...rest} className={classes} href={href} onClick={handleClick} ref={ref}>
        {content}
      </ElementType>
    )
  }

  return (
    <ElementType {...rest} className={classes} href={href} onClick={handleClick} ref={ref}>
      {Icon.create(icon, { autoGenerateKey: false })}
      {StepContent.create({ description, title }, { autoGenerateKey: false })}
    </ElementType>
  )
}

Step.displayName = 'Step'
Step.handledProps = [
  'as',
  'active',
  'children',
  'className',
  'completed',
  'content',
  'description',
  'disabled',
  'href',
  'icon',
  'link',
  'onClick',
  'ordered',
  'title',
]

Step.Content = StepContent
Step.Description = StepDescription
Step.Group = StepGroup
Step.Title = StepTitle

Step.create = createShorthandFactory(Step, (content) => ({ content }))

export default Step

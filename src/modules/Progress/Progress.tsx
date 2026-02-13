import cx from 'clsx'
import _ from 'lodash'
import * as React from 'react'

import {
  childrenUtils,
  createHTMLDivision,
  getComponentType,
  getUnhandledProps,
  getKeyOnly,
  getValueAndKey,
} from '../../lib'
import type {
  HtmlLabelProps,
  SemanticCOLORS,
  SemanticShorthandContent,
  SemanticShorthandItem,
} from '../../generic'

export interface StrictProgressProps {
  /** An element type to render as (string or function). */
  as?: React.ElementType

  /** A progress bar can show activity. */
  active?: boolean

  /** A progress bar can attach to and show the progress of an element (i.e. Card or Segment). */
  attached?: 'top' | 'bottom'

  /** Whether success state should automatically trigger when progress completes. */
  autoSuccess?: boolean

  /** Primary content. */
  children?: React.ReactNode

  /** Additional classes. */
  className?: string

  /** A progress bar can have different colors. */
  color?: SemanticCOLORS

  /** Shorthand for primary content. */
  content?: SemanticShorthandContent

  /** A progress bar be disabled. */
  disabled?: boolean

  /** A progress bar can show a error state. */
  error?: boolean

  /** An indicating progress bar visually indicates the current level of progress of a task. */
  indicating?: boolean

  /** A progress bar can have its colors inverted. */
  inverted?: boolean

  /** Can be set to either to display progress as percent or ratio. */
  label?: SemanticShorthandItem<HtmlLabelProps>

  /** Current percent complete. */
  percent?: number | string

  /** Decimal point precision for calculated progress. */
  precision?: number

  /** A progress bar can contain a text value indicating current progress. */
  progress?: boolean | 'percent' | 'ratio' | 'value'

  /** A progress bar can vary in size. */
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'big'

  /** A progress bar can show a success state. */
  success?: boolean

  /** For use with value. Together, these will calculate the percent. Mutually excludes percent. */
  total?: number | string

  /** For use with total. Together, these will calculate the percent. Mutually excludes percent. */
  value?: number | string

  /** A progress bar can show a warning state. */
  warning?: boolean
}

export interface ProgressProps extends StrictProgressProps {
  [key: string]: any
}

/**
 * @param {Number|String} percent
 * @param {Number|String} total
 * @param {Number|String} value
 *
 * @return {Number|String}
 */
function calculatePercent(
  percent: number | string | undefined,
  total: number | string | undefined,
  value: number | string | undefined,
): number | string {
  if (!_.isUndefined(percent)) {
    return percent
  }

  if (!_.isUndefined(total) && !_.isUndefined(value)) {
    return ((value as number) / (total as number)) * 100
  }

  return 0
}

/**
 * @param {Number|String} percent
 * @param {Number|String} total
 * @param {Number|String} value
 * @param {Boolean|'percent'|'ratio'|'value'} progress
 * @param {Number} precision
 *
 * @return {Number}
 */
function getPercent(
  percent: number | string | undefined,
  total: number | string | undefined,
  value: number | string | undefined,
  progress: boolean | 'percent' | 'ratio' | 'value' | undefined,
  precision: number | undefined,
): number | string {
  const clampedPercent = _.clamp(calculatePercent(percent, total, value) as number, 0, 100)

  if (!_.isUndefined(total) && !_.isUndefined(value) && progress === 'value') {
    return ((value as number) / (total as number)) * 100
  }

  if (progress === 'value') {
    return value as number
  }

  if (_.isUndefined(precision)) {
    return clampedPercent
  }

  return _.round(clampedPercent, precision)
}

/**
 * A progress bar shows the progression of a task.
 */
function Progress({ ref, ...props }: ProgressProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    active,
    autoSuccess,
    attached,
    children,
    className,
    color,
    content,
    disabled,
    error,
    indicating,
    inverted,
    label,
    percent,
    precision,
    progress,
    total,
    size,
    success,
    value,
    warning,
  } = props

  const calculatedPercent = (getPercent(percent, total, value, progress, precision) as number) || 0
  const isAutoSuccess = autoSuccess && ((percent as number) >= 100 || (value as number) >= (total as number))

  const computeValueText = () => {
    if (progress === 'value') {
      return value
    }

    if (progress === 'ratio') {
      return `${value}/${total}`
    }

    return `${calculatedPercent}%`
  }

  const renderLabel = () => {
    if (!childrenUtils.isNil(children)) {
      return <div className='label'>{children}</div>
    }

    if (!childrenUtils.isNil(content)) {
      return <div className='label'>{content}</div>
    }

    return createHTMLDivision(label, {
      autoGenerateKey: false,
      defaultProps: { className: 'label' },
    })
  }

  const renderProgress = () => {
    if (!progress && _.isUndefined(precision)) {
      return
    }

    return <div className='progress'>{computeValueText()}</div>
  }

  const classes = cx(
    'ui',
    color,
    size,
    getKeyOnly(active || indicating, 'active'),
    getKeyOnly(disabled, 'disabled'),
    getKeyOnly(error, 'error'),
    getKeyOnly(indicating, 'indicating'),
    getKeyOnly(inverted, 'inverted'),
    getKeyOnly(success || isAutoSuccess, 'success'),
    getKeyOnly(warning, 'warning'),
    getValueAndKey(attached, 'attached'),
    'progress',
    className,
  )
  const rest = getUnhandledProps(Progress, props)
  const ElementType = getComponentType(props)

  return (
    <ElementType
      {...rest}
      className={classes}
      data-percent={Math.floor(calculatedPercent)}
      ref={ref}
    >
      <div className='bar' style={{ width: `${calculatedPercent}%` }}>
        {renderProgress()}
      </div>
      {renderLabel()}
    </ElementType>
  )
}

Progress.displayName = 'Progress'
Progress.handledProps = [
  'as',
  'active',
  'attached',
  'autoSuccess',
  'children',
  'className',
  'color',
  'content',
  'disabled',
  'error',
  'indicating',
  'inverted',
  'label',
  'percent',
  'precision',
  'progress',
  'size',
  'success',
  'total',
  'value',
  'warning',
]

export default Progress

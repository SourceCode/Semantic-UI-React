import * as React from 'react'

import { getUnhandledProps } from '../../lib'
import type { StrictCheckboxProps } from '../../modules/Checkbox'
import Checkbox from '../../modules/Checkbox'

export interface StrictRadioProps extends StrictCheckboxProps {
  /** Format to emphasize the current selection state. */
  slider?: boolean

  /** Format to show an on or off choice. */
  toggle?: boolean

  /** HTML input type, either checkbox or radio. */
  type?: 'checkbox' | 'radio'
}

export interface RadioProps extends StrictRadioProps {
  [key: string]: any
}

/**
 * A Radio is sugar for <Checkbox radio />.
 * Useful for exclusive groups of sliders or toggles.
 * @see Checkbox
 * @see Form
 */
function Radio({ ref, ...props }: RadioProps & { ref?: React.Ref<HTMLInputElement> }) {
  const { slider, toggle, type = 'radio' } = props

  const rest = getUnhandledProps(Radio, props)
  // radio, slider, toggle are exclusive
  // use an undefined radio if slider or toggle are present
  const radio = !(slider || toggle) || undefined

  return <Checkbox {...rest} type={type} radio={radio} slider={slider} toggle={toggle} ref={ref} />
}

Radio.displayName = 'Radio'
Radio.handledProps = [
  'slider',
  'toggle',
  'type',
]

export default Radio

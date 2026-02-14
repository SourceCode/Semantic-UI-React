import _ from 'lodash'
import type { Placement } from '@floating-ui/react-dom'

type PopupPosition =
  | 'top center'
  | 'top left'
  | 'top right'
  | 'bottom center'
  | 'bottom left'
  | 'bottom right'
  | 'right center'
  | 'left center'

export const positionsMapping: Record<PopupPosition, Placement> = {
  'top center': 'top',
  'top left': 'top-start',
  'top right': 'top-end',

  'bottom center': 'bottom',
  'bottom left': 'bottom-start',
  'bottom right': 'bottom-end',

  'right center': 'right',
  'left center': 'left',
}

export const positions: string[] = _.keys(positionsMapping)

export const placementMapping: Record<string, string> = _.invert(positionsMapping)

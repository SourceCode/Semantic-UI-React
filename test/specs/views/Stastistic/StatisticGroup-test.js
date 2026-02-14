import _ from 'lodash'
import { render } from '@testing-library/react'

import { SUI } from 'src/lib'
import StatisticGroup from 'src/views/Statistic/StatisticGroup'
import * as common from 'test/specs/commonTests'

describe('StatisticGroup', () => {
  common.isConformant(StatisticGroup)
  common.hasUIClassName(StatisticGroup)
  common.rendersChildren(StatisticGroup)

  common.implementsWidthProp(StatisticGroup, SUI.WIDTHS, {
    canEqual: false,
    propKey: 'widths',
  })

  common.propKeyOnlyToClassName(StatisticGroup, 'horizontal')
  common.propKeyOnlyToClassName(StatisticGroup, 'inverted')

  common.propValueOnlyToClassName(StatisticGroup, 'color', SUI.COLORS)
  common.propValueOnlyToClassName(
    StatisticGroup,
    'size',
    _.without(SUI.SIZES, 'big', 'massive', 'medium'),
  )

  describe('items', () => {
    it('renders children', () => {
      const { container } = render(<StatisticGroup items={['foo', 'bar']} />)
      const statistics = container.querySelectorAll('.statistic')

      expect(statistics).toHaveLength(2)
      expect(statistics[0]).toHaveTextContent('foo')
      expect(statistics[1]).toHaveTextContent('bar')
    })
  })
})

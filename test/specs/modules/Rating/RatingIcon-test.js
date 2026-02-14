import { render, fireEvent } from '@testing-library/react'

import RatingIcon from 'src/modules/Rating/RatingIcon'
import * as common from 'test/specs/commonTests'

describe('RatingIcon', () => {
  common.isConformant(RatingIcon)

  common.propKeyOnlyToClassName(RatingIcon, 'active')
  common.propKeyOnlyToClassName(RatingIcon, 'selected')

  describe('onClick', () => {
    it('calls onClick with (e, data) when space key is pressed', () => {
      const onClick = vi.fn()
      const preventDefault = vi.fn()

      const { container } = render(<RatingIcon index={0} onClick={onClick} />)

      fireEvent.keyUp(container.firstChild, {
        key: ' ',
        preventDefault,
      })

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ index: 0 }),
      )
    })

    it('calls onClick with (e, data) when enter key is pressed', () => {
      const onClick = vi.fn()
      const preventDefault = vi.fn()

      const { container } = render(<RatingIcon index={0} onClick={onClick} />)

      fireEvent.keyUp(container.firstChild, {
        key: 'Enter',
        preventDefault,
      })

      expect(onClick).toHaveBeenCalledOnce()
      expect(onClick).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ index: 0 }),
      )
    })

    it('does not call onClick when non space/enter key is pressed', () => {
      const onClick = vi.fn()

      const { container } = render(<RatingIcon onClick={onClick} />)

      fireEvent.keyUp(container.firstChild, { key: 'a' })

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('onKeyUp', () => {
    it('calls onKeyUp with (e, data) when key is pressed', () => {
      const onKeyUp = vi.fn()
      const { container } = render(<RatingIcon index={0} onKeyUp={onKeyUp} />)

      fireEvent.keyUp(container.firstChild)

      expect(onKeyUp).toHaveBeenCalledOnce()
      expect(onKeyUp).toHaveBeenCalledWith(
        expect.objectContaining({}),
        expect.objectContaining({ index: 0 }),
      )
    })
  })
})

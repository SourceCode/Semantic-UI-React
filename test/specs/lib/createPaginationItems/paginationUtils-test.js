import {
  isSimplePagination,
  typifyOptions,
} from 'src/lib/createPaginationItems/paginationUtils'

describe('paginationUtils', () => {
  describe('isSimplePagination', () => {
    it('returns true when total pages fit in the range', () => {
      expect(
        isSimplePagination({
          boundaryRange: 2,
          hideEllipsis: false,
          siblingRange: 2,
          totalPages: 3,
        }),
      ).toBe(true)
    })

    it('returns false when total pages exceed the range', () => {
      expect(
        isSimplePagination({
          boundaryRange: 1,
          hideEllipsis: false,
          siblingRange: 1,
          totalPages: 20,
        }),
      ).toBe(false)
    })

    it('accounts for hideEllipsis', () => {
      expect(
        isSimplePagination({
          boundaryRange: 1,
          hideEllipsis: true,
          siblingRange: 1,
          totalPages: 5,
        }),
      ).toBe(true)
    })
  })

  describe('typifyOptions', () => {
    it('converts string values to numbers and booleans', () => {
      expect(
        typifyOptions({
          activePage: '5',
          boundaryRange: '2',
          hideEllipsis: '',
          siblingRange: '1',
          totalPages: '10',
        }),
      ).toEqual({
        activePage: 5,
        boundaryRange: 2,
        hideEllipsis: false,
        siblingRange: 1,
        totalPages: 10,
      })
    })

    it('preserves correct types', () => {
      expect(
        typifyOptions({
          activePage: 3,
          boundaryRange: 1,
          hideEllipsis: true,
          siblingRange: 2,
          totalPages: 15,
        }),
      ).toEqual({
        activePage: 3,
        boundaryRange: 1,
        hideEllipsis: true,
        siblingRange: 2,
        totalPages: 15,
      })
    })
  })
})

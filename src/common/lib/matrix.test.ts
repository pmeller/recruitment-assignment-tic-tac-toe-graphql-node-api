import { getColumns, getDiagonals, getRows } from './matrix'

describe('getRows', () => {
  test('returns rows of matrix', () => {
    const matrix = [
      [1, 1],
      [0, 0],
    ]

    const result = getRows(matrix)

    expect(result).toEqual([
      [1, 1],
      [0, 0],
    ])
  })
})

describe('getColumns', () => {
  test('returns rows of matrix', () => {
    const matrix = [
      [1, 1],
      [0, 0],
    ]

    const result = getColumns(matrix)

    expect(result).toEqual([
      [1, 0],
      [1, 0],
    ])
  })
})

describe('getDiagonals', () => {
  test('returns major diagonal of matrix', () => {
    const matrix = [
      [1, 0],
      [0, 1],
    ]

    const result = getDiagonals(matrix)

    expect(result.major).toEqual([1, 1])
  })

  test('returns minor diagonal of matrix', () => {
    const matrix = [
      [0, 1],
      [1, 0],
    ]

    const result = getDiagonals(matrix)

    expect(result.minor).toEqual([1, 1])
  })
})

import { range } from 'lodash'

export type Matrix<T> = T[][]

export const getRows = <T>(matrix: Matrix<T>) => matrix

export const getColumns = <T>(matrix: Matrix<T>) => {
  const columnsLength = matrix[0].length
  return range(columnsLength).map(idx => matrix.map(row => row[idx]))
}

// ref: https://en.wikipedia.org/wiki/Main_diagonal
export const getDiagonals = <T>(matrix: Matrix<T>) => {
  const rowsLength = matrix.length
  const columnsLength = matrix[0].length

  const diagonalLength = Math.min(rowsLength, columnsLength)

  return {
    major: range(diagonalLength).map(idx => matrix[idx][idx]),
    minor: range(diagonalLength).map(idx => matrix[idx][diagonalLength - (idx + 1)]),
  }
}

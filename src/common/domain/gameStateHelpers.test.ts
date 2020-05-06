import { checkGameBoardForResult } from './gameStateHelpers'
import { FieldState, GameBoard, Player } from './types'

describe('checkGameBoardForResult', () => {
  const _ = FieldState.Empty
  const X = FieldState.X
  const O = FieldState.O

  test('not detects game finish if is not full or there is no winning line', () => {
    const board: GameBoard = [
      [O, _, _],
      [_, X, _],
      [_, _, O],
    ]

    const result = checkGameBoardForResult(board)

    expect(result.isFinished).toBe(false)
    expect(result.winner).toBeUndefined()
  })

  test('detects game finish if board is full', () => {
    const board: GameBoard = [
      [X, X, O],
      [O, O, X],
      [X, O, X],
    ]

    const result = checkGameBoardForResult(board)

    expect(result.isFinished).toBe(true)
    expect(result.winner).toBeUndefined()
  })

  test('matches winning rows', () => {
    const board: GameBoard = [
      [O, O, _],
      [X, X, X],
      [_, _, _],
    ]

    const result = checkGameBoardForResult(board)
    expect(result.isFinished).toBe(true)
    expect(result.winner).toBe(Player.X)
  })

  test('matches winning columns', () => {
    const board: GameBoard = [
      [O, _, X],
      [O, _, X],
      [_, _, X],
    ]

    const result = checkGameBoardForResult(board)
    expect(result.isFinished).toBe(true)
    expect(result.winner).toBe(Player.X)
  })

  test('matches winning major diagonal', () => {
    const board: GameBoard = [
      [X, _, _],
      [O, X, _],
      [_, O, X],
    ]

    const result = checkGameBoardForResult(board)
    expect(result.isFinished).toBe(true)
    expect(result.winner).toBe(Player.X)
  })

  test('matches winning minor diagonal', () => {
    const board: GameBoard = [
      [_, O, X],
      [O, X, _],
      [X, _, _],
    ]

    const result = checkGameBoardForResult(board)
    expect(result.isFinished).toBe(true)
    expect(result.winner).toBe(Player.X)
  })
})

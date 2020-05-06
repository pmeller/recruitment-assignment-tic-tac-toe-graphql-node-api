import { repeat } from '../lib/array'
import { getColumns, getDiagonals, getRows } from '../lib/matrix'

import { FieldState, GameBoard, GameStage, GameState, Player } from '.'

const BOARD_SIZE = 3

export const createInitialGameState = (startingPlayer: Player): GameState => ({
  stage: GameStage.WaitingForPlayers,
  currentPlayer: startingPlayer,
  board: createEmptyBoard(),
})

const createEmptyBoard = (): GameBoard => repeat(BOARD_SIZE, repeat(BOARD_SIZE, FieldState.Empty))

export const checkGameBoardForResult = (board: GameBoard): { isFinished: boolean; winner?: Player } => {
  const isFull = !board.some(row => row.some(field => field === FieldState.Empty))

  const rowWinner = getRows(board).map(checkFieldsLineForWinner).find(Boolean)
  const columnWinner = getColumns(board).map(checkFieldsLineForWinner).find(Boolean)

  const { major, minor } = getDiagonals(board)
  const diagonalsWinner = checkFieldsLineForWinner(major) || checkFieldsLineForWinner(minor)

  const winner = rowWinner || columnWinner || diagonalsWinner

  return {
    isFinished: !!winner || isFull,
    winner,
  }
}

const checkFieldsLineForWinner = (line: FieldState[]): Player | undefined => {
  // eslint-disable-next-line functional/no-loop-statement
  for (const player of [Player.X, Player.O]) {
    const playerField = playerToFieldState(player)

    if (line.every(field => field === playerField)) {
      return player
    }
  }

  return undefined
}

export const playerToFieldState = (value: Player): FieldState =>
  ({
    [Player.X]: FieldState.X,
    [Player.O]: FieldState.O,
  }[value])

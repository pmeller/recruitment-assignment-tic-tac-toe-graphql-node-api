import { sample } from 'lodash'

import { createLogger } from '../lib/logging'

import { FieldState, GameState, IGameBot } from './types'

const logger = createLogger('RandomGameBot')

export class RandomGameBot implements IGameBot {
  public makeMove(state: GameState): { x: number; y: number } {
    logger.debug('makeMove', state)

    const emptyFields = state.board.flatMap((row, x) =>
      row.map((value, y) => ({ position: { x, y }, value })).filter(({ value }) => value === FieldState.Empty)
    )

    const chosenField = sample(emptyFields)

    if (!chosenField) {
      throw new Error('Cannot make move, there are no empty fields')
    }

    return chosenField.position
  }
}

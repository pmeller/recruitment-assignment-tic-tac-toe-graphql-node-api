import { nanoid } from 'nanoid'

import { createLogger } from '../lib/logging'

import { Game, IGameRepository, NewGame } from './types'

const logger = createLogger('MemoryGameRepository')

export class MemoryGameRepository implements IGameRepository {
  private games = new Map<Game['id'], Game>()

  public async getById(id: string): Promise<Game | undefined> {
    logger.debug('getById', id)

    return this.games.get(id)
  }

  public async create(newGame: NewGame): Promise<Game> {
    logger.debug('create', newGame)

    // NOTE: ensure ID uniqueness
    // eslint-disable-next-line functional/no-let
    let newId: Game['id']

    // eslint-disable-next-line functional/no-loop-statement
    do {
      newId = nanoid()
    } while (this.games.has(newId))

    const game: Game = {
      id: newId,
      ...newGame,
    }

    this.games.set(newId, game)

    return game
  }

  public async update(game: Game): Promise<Game> {
    logger.debug('update', game)

    this.games.set(game.id, game)

    return game
  }
}

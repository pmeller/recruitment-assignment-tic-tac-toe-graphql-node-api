import { sample } from 'lodash'
import { nanoid } from 'nanoid'
import { Observable, Subject } from 'rxjs'
import { filter, takeWhile } from 'rxjs/operators'

import { createLogger } from '../lib/logging'

import { checkGameBoardForResult, createInitialGameState, playerToFieldState } from './gameStateHelpers'
import {
  FieldState,
  Game,
  GameStage,
  GameState,
  IGameBot,
  IGameManager,
  IGameRepository,
  Move,
  NewGame,
  Player,
  PlayerConfig,
  PlayerType,
  Token,
} from './types'

const logger = createLogger('GameManager')

type PendingBotMove = {
  gameId: Game['id']
}

export class GameManager implements IGameManager {
  private gameRepository: IGameRepository
  private gameBot: IGameBot

  // TODO: Bot moves are handled asynchronously to mimic real users behaviour
  // (gives ability to add timeout but also requires watching for changes by client)
  private readonly pendingBotMove$ = new Subject<PendingBotMove>()

  // NOTE: Can be change to ReplaySubject to support getting values from the past (risk of bloating the memory)
  private readonly gameStateChange$ = new Subject<Game>()

  public constructor({ gameRepository, gameBot }: { gameRepository: IGameRepository; gameBot: IGameBot }) {
    this.gameRepository = gameRepository
    this.gameBot = gameBot

    this.pendingBotMove$.subscribe({
      next: pendingBotMove => {
        this.performBotMove(pendingBotMove)
      },
    })
  }
  public async getGameById(gameId: Game['id']): Promise<Game | undefined> {
    logger.debug('getGameById', gameId)

    return this.gameRepository.getById(gameId)
  }

  public async createGame({ player1, player2 }: { player1: PlayerType; player2: PlayerType }): Promise<Game> {
    logger.debug('createGame', player1, player2)

    // NOTE: Assumption - X always starts by convention
    const startingPlayer = Player.X

    const newGame: NewGame = {
      player1: this.createPlayerConfig(player1, Player.X),
      player2: this.createPlayerConfig(player2, Player.O),
      state: createInitialGameState(startingPlayer),
      moves: [],
    }

    const savedGame = await this.gameRepository.create(newGame)

    this.enqueueBotMove(savedGame)

    return savedGame
  }

  public async joinGame(gameId: string): Promise<{ token: string; player: Player }> {
    logger.debug('joinGame', gameId)

    const game = await this.getGameById(gameId)

    if (!game) {
      throw new Error('Game with given ID does not exist')
    }

    const player = sample(this.getFreeSpots(game))

    if (!player) {
      throw new Error('Cannot join game, list of players is full')
    }

    // TODO: Extract to separate function
    const gameWithUpdatedPlayer: Game = {
      ...game,
      [player.key]: {
        ...player,
        hasJoined: true,
      },
    }

    // TODO: Extract to separate function
    const gameWithUpdatedState: Game = {
      ...gameWithUpdatedPlayer,
      ...(gameWithUpdatedPlayer.player1.hasJoined && gameWithUpdatedPlayer.player2.hasJoined
        ? {
            state: {
              ...gameWithUpdatedPlayer.state,
              stage: GameStage.InProgress,
            },
          }
        : {}),
    }

    await this.updateGameAndNotifyAboutGameStateChange(gameWithUpdatedState)

    return {
      player: player.mark,
      token: player.token,
    }
  }

  public async makeMove(gameId: string, token: string, move: { x: number; y: number }): Promise<Game> {
    logger.debug('joinGame', gameId, token, move)

    const game = await this.getGameById(gameId)

    if (!game) {
      throw new Error('Game with given ID does not exist')
    }

    const playerKey = this.getPlayerKeyByToken(game, token)

    if (!playerKey) {
      throw new Error('Invalid token')
    }

    const player = game[playerKey]
    const updatedGame = this.performMove(game, player.mark, move)

    await this.updateGameAndNotifyAboutGameStateChange(updatedGame)

    this.enqueueBotMove(updatedGame)

    return updatedGame
  }

  public gameStateChangesById(id: string): Observable<Game> {
    // FIXME: handle non-existing or finished game
    return this.gameStateChange$.pipe(
      filter(game => game.id === id),
      takeWhile(game => game.state.stage !== GameStage.Finished)
    )
  }

  private async updateGameAndNotifyAboutGameStateChange(game: Game) {
    await this.gameRepository.update(game)
    this.gameStateChange$.next(game)
  }

  private performMove(game: Game, currentPlayer: Player, move: { x: number; y: number }): Game {
    const { state } = game

    // TODO: Extract to separate function
    const targetFieldState = state.board[move.x][move.y]
    if (targetFieldState !== FieldState.Empty) {
      throw new Error('Cannot make move, position is not empty or invalid position index')
    }

    // TODO: Extract to separate function
    const updatedBoard = state.board.map((row, x) =>
      row.map((field, y) => (x === move.x && y === move.y ? playerToFieldState(currentPlayer) : field))
    )

    const { isFinished, winner } = checkGameBoardForResult(updatedBoard)

    // TODO: Extract to separate function
    const updatedState: GameState = {
      stage: isFinished ? GameStage.Finished : GameStage.InProgress,
      board: updatedBoard,
      currentPlayer: isFinished ? undefined : currentPlayer === Player.X ? Player.O : Player.X,
      winner,
    }

    const newMove: Move = {
      player: currentPlayer,
      positionX: move.x,
      positionY: move.y,
    }

    const updatedGame = {
      ...game,
      state: updatedState,
      moves: [...game.moves, newMove],
    }

    return updatedGame
  }

  private enqueueBotMove(game: Game) {
    if (game.state.stage !== GameStage.Finished && this.isCurrentPlayerBot(game)) {
      this.pendingBotMove$.next({
        gameId: game.id,
      })
    }
  }

  private async performBotMove({ gameId }: PendingBotMove) {
    const game = (await this.getGameById(gameId))!
    const move = await this.gameBot.makeMove(game.state)
    const updatedGame = this.performMove(game, game.state.currentPlayer!, move)

    await this.updateGameAndNotifyAboutGameStateChange(updatedGame)

    this.enqueueBotMove(updatedGame)
  }

  private createPlayerConfig(playerType: PlayerType, player: Player) {
    return {
      type: playerType,
      token: nanoid(),
      mark: player,
      hasJoined: playerType === PlayerType.Human ? false : true,
    }
  }

  // FIXME: Referencing player by key is quite ugly, consider changing model to something easier to update
  private getFreeSpots(game: Game): Array<PlayerConfig & { key: 'player1' | 'player2' }> {
    return [
      { key: 'player1' as const, ...game.player1 },
      { key: 'player2' as const, ...game.player2 },
    ].filter(({ hasJoined }) => !hasJoined)
  }

  private getPlayerKeyByToken(game: Game, token: Token): 'player1' | 'player2' | undefined {
    if (game.player1.token === token) return 'player1'
    if (game.player2.token === token) return 'player2'

    return undefined
  }

  private isCurrentPlayerBot(game: Game) {
    return this.getPlayerConfigByMark(game, game.state.currentPlayer!).type === PlayerType.Bot
  }

  private getPlayerConfigByMark(game: Game, mark: Player): PlayerConfig {
    if (game.player1.mark === mark) {
      return game.player1
    }

    return game.player2
  }
}

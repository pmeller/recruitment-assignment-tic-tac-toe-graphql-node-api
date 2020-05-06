import { FieldState, Game, GameStage, GameState, Move, Player, PlayerType } from '../../common/domain'

import { GQLFieldState, GQLGame, GQLGameStage, GQLGameState, GQLPlayer, GQLPlayerType } from './types'

// NOTE: Fancier serialization/deserialization mechanism with less boilerplate can be implemented but it would be overkill for this particular project

export const serializeGame = ({ id, state, player1, player2, moves }: Game): GQLGame => ({
  id,
  state: serializeGameState(state),
  playerType1: serializePlayerType(player1.type),
  playerType2: serializePlayerType(player2.type),
  movesHistory: moves.map(serializeMove),
})

export const serializeGameState = ({ stage, currentPlayer, board, winner }: GameState): GQLGameState => ({
  stage: serializeGameStage(stage),
  currentPlayer: currentPlayer ? serializePlayer(currentPlayer) : undefined,
  board: board.map(row => row.map(serializeFieldState)),
  winner: winner ? serializePlayer(winner) : undefined,
})

export const serializeMove = ({ player, ...others }: Move) => ({
  ...others,
  player: serializePlayer(player),
})

export const serializePlayer = (value: Player): GQLPlayer =>
  ({
    [Player.X]: GQLPlayer.X,
    [Player.O]: GQLPlayer.O,
  }[value])

export const serializePlayerType = (value: PlayerType): GQLPlayerType =>
  ({
    [PlayerType.Human]: GQLPlayerType.HUMAN,
    [PlayerType.Bot]: GQLPlayerType.BOT,
  }[value])

export const serializeFieldState = (value: FieldState): GQLFieldState =>
  ({
    [FieldState.Empty]: GQLFieldState.EMPTY,
    [FieldState.X]: GQLFieldState.X,
    [FieldState.O]: GQLFieldState.O,
  }[value])

export const serializeGameStage = (value: GameStage): GQLGameStage =>
  ({
    [GameStage.WaitingForPlayers]: GQLGameStage.WAITING_FOR_PLAYERS,
    [GameStage.InProgress]: GQLGameStage.IN_PROGRESS,
    [GameStage.Finished]: GQLGameStage.FINISHED,
  }[value])

export const parsePlayerType = (value: GQLPlayerType): PlayerType =>
  ({
    [GQLPlayerType.BOT]: PlayerType.Bot,
    [GQLPlayerType.HUMAN]: PlayerType.Human,
  }[value])

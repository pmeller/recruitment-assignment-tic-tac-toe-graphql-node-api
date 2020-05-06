import { Observable } from 'rxjs'

export interface IGameManager {
  getGameById(gameId: Game['id']): Promise<Game | undefined>
  createGame(params: { player1: PlayerType; player2: PlayerType }): Promise<Game>
  joinGame(gameId: Game['id']): Promise<{ token: Token; player: Player }>
  makeMove(gameId: Game['id'], token: Token, move: { x: number; y: number }): Promise<Game>
  gameStateChangesById(id: Game['id']): Observable<Game>
}

export interface IGameBot {
  makeMove(state: GameState): { x: number; y: number }
}

export interface IGameRepository {
  getById(id: Game['id']): Promise<Game | undefined>
  create(newGame: Omit<Game, 'id'>): Promise<Game>
  update(game: Game): Promise<Game>
}

export type Token = string

export type Game = {
  id: string
  state: GameState
  player1: PlayerConfig
  player2: PlayerConfig
  moves: Move[]
}

export type NewGame = Omit<Game, 'id'>

export type PlayerConfig = {
  type: PlayerType
  mark: Player
  token: Token
  hasJoined: boolean
}

export type Move = {
  player: Player
  positionX: number
  positionY: number
}

export type GameState = {
  stage: GameStage
  currentPlayer?: Player
  board: GameBoard
  winner?: Player
}

export type GameBoard = FieldState[][]

export enum Player {
  X = 'X',
  O = 'O',
}

export enum PlayerType {
  Human = 'Human',
  Bot = 'Bot',
}

export enum FieldState {
  Empty = 'Empty',
  X = 'X',
  O = 'O',
}

export enum GameStage {
  WaitingForPlayers = 'WaitingForPlayers',
  InProgress = 'InProgress',
  Finished = 'Finished',
}

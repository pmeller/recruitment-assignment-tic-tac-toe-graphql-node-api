/* eslint-disable functional/no-let */
import { GQLFieldState, GQLGameStage, GQLGameState, GQLPlayer, GQLPlayerType } from '../server/schema'

import { initIntegrationTests, playerToFieldState, TestClient } from './helpers'

let client: TestClient

beforeAll(async () => {
  client = initIntegrationTests().client
})

test('human vs human gameplay', async () => {
  const _ = GQLFieldState.EMPTY

  let game = await client.createGame({
    playerType1: GQLPlayerType.HUMAN,
    playerType2: GQLPlayerType.HUMAN,
  })

  const startingPlayer = game.state.currentPlayer

  expect(game).not.toBeNull()
  expect(game.playerType1).toBe(GQLPlayerType.HUMAN)
  expect(game.playerType2).toBe(GQLPlayerType.HUMAN)
  expect(game.state.stage).toBe(GQLGameStage.WAITING_FOR_PLAYERS)
  expect(game.state.board).toEqual([
    [_, _, _],
    [_, _, _],
    [_, _, _],
  ])
  expect([GQLPlayer.X, GQLPlayer.O]).toContain(startingPlayer)

  const joinGameResult1 = await client.joinGame(game.id)
  expect(joinGameResult1.game.state.stage).toBe(GQLGameStage.WAITING_FOR_PLAYERS)

  const joinGameResult2 = await client.joinGame(game.id)
  expect(joinGameResult2.game.state.stage).toBe(GQLGameStage.IN_PROGRESS)

  // NOTE: In fact player mark is randomly assigned, so values can be swapped (it doesn't affect result of this test)
  const X = playerToFieldState(joinGameResult1.game.state.currentPlayer!)
  const O = X === GQLFieldState.X ? GQLFieldState.O : GQLFieldState.X

  const getTokenForPlayer = (player: GQLPlayer): string =>
    ({
      [joinGameResult1.player]: joinGameResult1.token,
      [joinGameResult2.player]: joinGameResult2.token,
    }[player])

  const movesSequence: Array<[{ x: number; y: number }, GQLGameState['board']]> = [
    [
      { x: 1, y: 1 },
      [
        [_, _, _],
        [_, X, _],
        [_, _, _],
      ],
    ],
    [
      { x: 0, y: 0 },
      [
        [O, _, _],
        [_, X, _],
        [_, _, _],
      ],
    ],
    [
      { x: 1, y: 0 },
      [
        [O, _, _],
        [X, X, _],
        [_, _, _],
      ],
    ],
    [
      { x: 2, y: 2 },
      [
        [O, _, _],
        [X, X, _],
        [_, _, O],
      ],
    ],
    [
      { x: 1, y: 2 },
      [
        [O, _, _],
        [X, X, X],
        [_, _, O],
      ],
    ],
  ]

  // eslint-disable-next-line functional/no-loop-statement
  for (const [{ x, y }, expectedBoard] of movesSequence) {
    expect([GQLPlayer.X, GQLPlayer.O]).toContain(game.state.currentPlayer)

    game = await client.makeMove({
      gameId: game.id,
      token: getTokenForPlayer(game.state.currentPlayer!),
      positionX: x,
      positionY: y,
    })

    expect(game.state.board).toEqual(expectedBoard)
  }

  expect(game.state.stage).toBe(GQLGameStage.FINISHED)
  expect(game.state.winner).toBe(startingPlayer)
  expect(game.state.currentPlayer).toBeNull()
  expect(game.movesHistory).toHaveLength(movesSequence.length)
})

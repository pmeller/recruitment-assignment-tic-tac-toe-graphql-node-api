/* eslint-disable functional/no-let */
import { sleep } from '../common/lib/sleep'
import { GQLFieldState, GQLGameStage, GQLPlayerType } from '../server/schema'

import { countFields, initIntegrationTests, pickRandomEmptyField, TestClient } from './helpers'

let client: TestClient

beforeAll(async () => {
  client = initIntegrationTests().client
})

test('human vs bot gameplay', async () => {
  const _ = GQLFieldState.EMPTY

  let game = await client.createGame({
    playerType1: GQLPlayerType.HUMAN,
    playerType2: GQLPlayerType.BOT,
  })

  expect(game).not.toBeNull()
  expect(game.playerType1).toBe(GQLPlayerType.HUMAN)
  expect(game.playerType2).toBe(GQLPlayerType.BOT)
  expect(game.state.stage).toBe(GQLGameStage.WAITING_FOR_PLAYERS)
  expect(game.state.board).toEqual([
    [_, _, _],
    [_, _, _],
    [_, _, _],
  ])

  const joinGameResult = await client.joinGame(game.id)
  game = joinGameResult.game

  expect(game.state.stage).toBe(GQLGameStage.IN_PROGRESS)

  const humanPlayer = joinGameResult.player

  const makeOrWaitForMove = async () => {
    if (game.state.currentPlayer === humanPlayer) {
      const { x, y } = pickRandomEmptyField(game.state.board)!

      game = await client.makeMove({
        gameId: game.id,
        token: joinGameResult.token,
        positionX: x,
        positionY: y,
      })
    } else {
      // NOTE: Subscription could be used to watch for bot moves but unfortunately `apollo-server-testing` doesn't support subscriptions
      await sleep(50)

      game = (await client.getGame(game.id))!
    }
  }

  await makeOrWaitForMove()
  await makeOrWaitForMove()
  await makeOrWaitForMove()
  await makeOrWaitForMove()

  expect(countFields(game.state.board, GQLFieldState.X)).toBe(2)
  expect(countFields(game.state.board, GQLFieldState.O)).toBe(2)
  expect(game.movesHistory).toHaveLength(4)
})

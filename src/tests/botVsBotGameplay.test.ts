/* eslint-disable functional/no-let */
import { sleep } from '../common/lib/sleep'
import { GQLFieldState, GQLGameStage, GQLPlayerType } from '../server/schema'

import { countFields, initIntegrationTests, TestClient } from './helpers'

let client: TestClient

beforeAll(async () => {
  client = initIntegrationTests().client
})

test('bot vs bot gameplay', async () => {
  const _ = GQLFieldState.EMPTY

  let game = await client.createGame({
    playerType1: GQLPlayerType.BOT,
    playerType2: GQLPlayerType.BOT,
  })

  expect(game).not.toBeNull()
  expect(game.playerType1).toBe(GQLPlayerType.BOT)
  expect(game.playerType2).toBe(GQLPlayerType.BOT)
  expect(game.state.stage).toBe(GQLGameStage.WAITING_FOR_PLAYERS)
  expect(game.state.board).toEqual([
    [_, _, _],
    [_, _, _],
    [_, _, _],
  ])

  // NOTE: Subscription could be used to watch for bot moves but unfortunately `apollo-server-testing` doesn't support subscriptions
  await sleep(100)

  game = (await client.getGame(game.id))!

  // NOTE: Game is performed by non-deterministic bots so we can only check for minimal set of assertions.
  // Some deterministic implementation of IGameBot can be used to improve this test.

  // game has at least 5 moves and 9 at max
  const emptyCount = countFields(game.state.board, GQLFieldState.EMPTY)
  expect(emptyCount).toBeLessThanOrEqual(4)

  expect(game.state.stage).toBe(GQLGameStage.FINISHED)
})

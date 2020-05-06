/* eslint-disable functional/no-let */
import { initIntegrationTests, TestClient } from './helpers'

let client: TestClient

beforeAll(async () => {
  client = initIntegrationTests().client
})

test('get non-existing game', async () => {
  const game = await client.getGame('non-exisitng')

  expect(game).toBeNull()
})

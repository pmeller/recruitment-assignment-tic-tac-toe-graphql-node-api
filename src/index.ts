import { name as appName, version as appVersion } from '../package.json'

import { GameManager, MemoryGameRepository, RandomGameBot } from './common/domain'
import { GameServer } from './server/GameServer'

const server = new GameServer({
  serverName: `${appName}@${appVersion}`,
  gameManager: new GameManager({
    gameRepository: new MemoryGameRepository(),
    gameBot: new RandomGameBot(),
  }),
})

server.run()

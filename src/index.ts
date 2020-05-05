import { name as appName, version as appVersion } from '../package.json'

import { initServer } from './server'

initServer(`${appName}@${appVersion}`)

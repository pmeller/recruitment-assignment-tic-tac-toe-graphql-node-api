import { readFileSync } from 'fs'
import { join } from 'path'

import { generateTypeScriptTypes } from 'graphql-schema-typescript'

const SCHEMA_PATH = join(__dirname, '../src/server/schema/schema.graphql')
const OUTPUT_PATH = join(__dirname, '../src/server/schema/types.ts')

const schema = readFileSync(SCHEMA_PATH).toString()

generateTypeScriptTypes(schema, OUTPUT_PATH, {
  smartTParent: true,
  smartTResult: true,
  requireResolverTypes: false, // TODO: Consider setting it to `true` (requires more tricky types handling in resolvers since all field are non-nullable)
  asyncResult: 'always',
})
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  })

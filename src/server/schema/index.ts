import { readFileSync } from 'fs'
import { join } from 'path'

import { gql } from 'apollo-server'
import { memoize } from 'lodash'

export * from './types'
export * from './serialization'

// NOTE: usually using blocking readFileSync is not a good but this particular function is called once on start up
export const getTypeDefs = memoize(() => {
  const filePath = join(__dirname, 'schema.graphql')
  const rawSchema = readFileSync(filePath).toString()

  return gql(rawSchema)
})

import { join } from 'path'

import { gql } from 'apollo-server'
import { readFile } from 'fs-extra'

export * from './types'

export const getTypeDefs = async () => {
  const filePath = join(__dirname, 'schema.graphql')
  const rawSchema = (await readFile(filePath)).toString()

  return gql(rawSchema)
}

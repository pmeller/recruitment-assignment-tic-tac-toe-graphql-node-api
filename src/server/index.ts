/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ApolloError, ApolloServer, Config, makeExecutableSchema } from 'apollo-server'

import { createLogger } from '../common/lib/logging'

import { ApolloLogging } from './logging/ApolloLogging'
import { getTypeDefs, GQLResolver } from './schema'

export const initServer = async (serverName: string) => {
  const typeDefs = await getTypeDefs()

  const resolvers: GQLResolver = {
    Query: {
      game: async () => {
        throw new ApolloError('Not implemented')
      },
    },
    Mutation: {
      createGame: async () => {
        throw new ApolloError('Not implemented')
      },
      joinGame: async () => {
        throw new ApolloError('Not implemented')
      },
      makeMove: async () => {
        throw new ApolloError('Not implemented')
      },
    },
    Subscription: {
      gameStateChanged: {
        resolve: async () => {
          throw new ApolloError('Not implemented')
        },
        subscribe: async () => {
          throw new ApolloError('Not implemented')
        },
      },
    },
  }

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: resolvers as any,
  })

  const logger = createLogger('ApolloServer')

  const serverConfig: Config = {
    schema,
    logger,
    debug: true,
    extensions: [() => new ApolloLogging(logger)],
  }

  const server = new ApolloServer(serverConfig)

  server.listen().then(({ url }) => {
    // eslint-disable-next-line no-console
    logger.info(`${serverName} Server ready at ${url}`)
  })
}

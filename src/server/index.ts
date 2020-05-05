import { ApolloError, ApolloServer, Config, makeExecutableSchema } from 'apollo-server'

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

  const serverConfig: Config = {
    schema,
  }

  const server = new ApolloServer(serverConfig)

  server.listen().then(({ url }) => {
    // eslint-disable-next-line no-console
    console.log(`${serverName} Server ready at ${url}`)
  })
}

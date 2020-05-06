/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { ApolloServer, Config } from 'apollo-server'
import { latestValueFrom } from 'rxjs-for-await'
import { map, tap } from 'rxjs/operators'

import { IGameManager } from '../common/domain'
import { createLogger } from '../common/lib/logging'

import { ApolloLogging } from './logging/ApolloLogging'
import { getTypeDefs, GQLGame, GQLResolver, parsePlayerType, serializeGame, serializePlayer } from './schema'

const logger = createLogger('ApolloServer')

export class GameServer {
  private serverName: string

  private apolloServer: ApolloServer

  public constructor({ serverName, gameManager }: { serverName: string; gameManager: IGameManager }) {
    this.serverName = serverName

    const typeDefs = getTypeDefs()

    const resolvers: GQLResolver = {
      Query: {
        game: async (_, { id }) => {
          const game = await gameManager.getGameById(id)

          return game ? serializeGame(game) : null
        },
      },
      Mutation: {
        createGame: async (_, { parameters: { playerType1, playerType2 } }) => {
          const game = await gameManager.createGame({
            player1: parsePlayerType(playerType1),
            player2: parsePlayerType(playerType2),
          })

          return serializeGame(game)
        },
        joinGame: async (_, { gameId }) => {
          const { token, player } = await gameManager.joinGame(gameId)
          const game = (await gameManager.getGameById(gameId))!

          return {
            token,
            player: serializePlayer(player),
            game: serializeGame(game),
          }
        },
        makeMove: async (_, { parameters: { gameId, token, positionX, positionY } }) => {
          const game = await gameManager.makeMove(gameId, token, { x: positionX, y: positionY })

          return serializeGame(game)
        },
      },
      Subscription: {
        gameStateChanged: {
          // @ts-ignore `graphql-schema-typescript` produces incorrectly typed result for subscriptions
          subscribe: (_, { id }): AsyncIterator<{ gameStateChanged: GQLGame }> => {
            logger.debug('Subscribing gameStateChanged', id)

            // NOTE: `rxjs-for-await` provides 4 different ways to convert Observable to AsynIterator, this seemed to be most suitable for our use case
            // ref: https://github.com/benlesh/rxjs-for-await
            return latestValueFrom(
              gameManager.gameStateChangesById(id).pipe(
                map(serializeGame),
                tap(game => {
                  logger.debug('New value for gameStateChanged', game)
                }),
                map(game => ({
                  gameStateChanged: game,
                }))
              )
            )
          },
        },
      },
    }

    const serverConfig: Config = {
      typeDefs,
      resolvers: resolvers as any,
      logger,
      debug: true,
      extensions: [() => new ApolloLogging(logger)],
    }

    this.apolloServer = new ApolloServer(serverConfig)
  }

  public run() {
    this.apolloServer.listen().then(({ url, subscriptionsUrl }) => {
      logger.info(`${this.serverName} Server ready at ${url} (subscriptions at ${subscriptionsUrl})`)
    })
  }

  public getApolloServer() {
    return this.apolloServer
  }
}

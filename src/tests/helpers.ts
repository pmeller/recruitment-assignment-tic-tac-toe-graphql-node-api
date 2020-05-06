import { ApolloServer, gql } from 'apollo-server'
import { ApolloServerTestClient, createTestClient } from 'apollo-server-testing'
import { sample } from 'lodash'

import { GameManager, MemoryGameRepository, RandomGameBot } from '../common/domain'
import { GameServer } from '../server/GameServer'
import {
  GQLFieldState,
  GQLGame,
  GQLGameParameters,
  GQLGameState,
  GQLJoinGameResult,
  GQLMakeMoveParameters,
  GQLPlayer,
} from '../server/schema'

export const initIntegrationTests = () => {
  const server = new GameServer({
    serverName: 'test',
    gameManager: new GameManager({
      gameRepository: new MemoryGameRepository(),
      gameBot: new RandomGameBot(),
    }),
  })

  const apolloServer = server.getApolloServer()

  const client = new TestClient(apolloServer)

  return {
    client,
  }
}

export class TestClient {
  private apolloClient: ApolloServerTestClient

  public constructor(apolloServer: ApolloServer) {
    this.apolloClient = createTestClient(apolloServer)
  }

  public async getGame(gameId: GQLGame['id']): Promise<GQLGame | null> {
    const response = await this.apolloClient.query({
      query: GET_GAME,
      variables: {
        id: gameId,
      },
    })

    return response.data!.game
  }

  public async createGame(parameters: GQLGameParameters): Promise<GQLGame> {
    const response = await this.apolloClient.mutate({
      mutation: CREATE_GAME,
      variables: {
        parameters,
      },
    })

    return response.data!.createGame
  }

  public async joinGame(gameId: GQLGame['id']): Promise<GQLJoinGameResult> {
    const response = await this.apolloClient.mutate({
      mutation: JOIN_GAME,
      variables: {
        id: gameId,
      },
    })

    return response.data!.joinGame
  }

  public async makeMove(parameters: GQLMakeMoveParameters): Promise<GQLGame> {
    const response = await this.apolloClient.mutate({
      mutation: MAKE_MOVE,
      variables: {
        parameters,
      },
    })

    return response.data!.makeMove
  }
}

// TODO: Consider using GraphQL fragments to reduce duplication

const GET_GAME = gql`
  query Game($id: ID!) {
    game(id: $id) {
      id
      state {
        stage
        currentPlayer
        board
        winner
      }
      playerType1
      playerType2
      movesHistory {
        player
        positionX
        positionY
      }
    }
  }
`

const CREATE_GAME = gql`
  mutation CreateGame($parameters: GameParameters!) {
    createGame(parameters: $parameters) {
      id
      state {
        stage
        currentPlayer
        board
        winner
      }
      playerType1
      playerType2
      movesHistory {
        player
        positionX
        positionY
      }
    }
  }
`

const JOIN_GAME = gql`
  mutation JoinGame($id: ID!) {
    joinGame(gameId: $id) {
      player
      token
      game {
        id
        state {
          stage
          currentPlayer
          board
          winner
        }
        playerType1
        playerType2
        movesHistory {
          player
          positionX
          positionY
        }
      }
    }
  }
`

const MAKE_MOVE = gql`
  mutation MakeMove($parameters: MakeMoveParameters!) {
    makeMove(parameters: $parameters) {
      id
      state {
        stage
        currentPlayer
        board
        winner
      }
      playerType1
      playerType2
      movesHistory {
        player
        positionX
        positionY
      }
    }
  }
`

export const playerToFieldState = (player: GQLPlayer): GQLFieldState =>
  ({
    [GQLPlayer.X]: GQLFieldState.X,
    [GQLPlayer.O]: GQLFieldState.O,
  }[player])

export const pickRandomEmptyField = (board: GQLGameState['board']) => {
  const emptyFields = board.flatMap((row, x) =>
    row.map((value, y) => ({ position: { x, y }, value })).filter(({ value }) => value === GQLFieldState.EMPTY)
  )

  return sample(emptyFields)?.position
}

export const countFields = (board: GQLGameState['board'], fieldState: GQLFieldState) =>
  board.flat().filter(field => field === fieldState).length

import { GraphQLExtension } from 'apollo-server'
import { print } from 'graphql'

import { ILogger } from '../../common/lib/logging'

type RequestDidStartParams = Parameters<NonNullable<GraphQLExtension['requestDidStart']>>[0]
type WillSendRespondeParams = Parameters<NonNullable<GraphQLExtension['willSendResponse']>>[0]
type DidEncounterErrorsParams = Parameters<NonNullable<GraphQLExtension['didEncounterErrors']>>[0]

export class ApolloLogging implements GraphQLExtension {
  public constructor(private logger: ILogger) {}

  public requestDidStart({ operationName, queryString, parsedQuery, variables }: RequestDidStartParams) {
    const query = queryString || (parsedQuery && print(parsedQuery))

    this.logger.debug('Operation', operationName)

    this.logger.debug('Query', query)
    this.logger.debug('Variables', variables)
  }

  public willSendResponse({ graphqlResponse }: WillSendRespondeParams) {
    this.logger.debug('Response', JSON.stringify(graphqlResponse, null, 2))
  }

  public didEncounterErrors(errors: DidEncounterErrorsParams) {
    errors.forEach(error => {
      this.logger.error(error)
    })
  }
}

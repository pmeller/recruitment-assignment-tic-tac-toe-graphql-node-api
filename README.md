# Recruitment Assignment: Tic-Tac-Toe GraphQL Node API

## Assignment description

Goal of the assignment is to provide API that allows to play Tic-Tac-Toe games.

API requirements:

- Create new game (human vs human or human vs AI)
- Join exisiting game
- Make a move
- Watch game via live subscription
- Get move history for a game

Technical requirements:

- API must be based on TypeScript and GraphQL
- Dependency Injection mechanism must be used

Remarks:

- AI can make random moves for simplicity
- Usage of DB is not necessary (please ensure that can be easily added in the future)

## Architectural considerations

Main assumption for this assignment is to keep things as simple as possible and try to not foresee future because it's very short-term project. Some parts can be not suitable for long-term project, I tried to emphasize them in this document and comments.

Following **decision log** is simple set of notes, it can be read from top to bottom in chronological order of decision making.

### Development tools

I've picked standard set of tools that make me productive when working with TypeScript (some configs are modified copies from my other projects):

- eslint with TS support for basic static code analysis
- prettier for auto-formatting
- NVM for ensuring proper Node version
- yarn for package management and scripts (NPM is my default but it came out during development that I need yarn's resolutions mechanism)
- [ts-node](https://github.com/TypeStrong/ts-node) for local execution environment

Tools to consider for larger codebases:

- [yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) for working with monorepo
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) for enforcing proper dependency graph
- [ts-unused-imports](https://github.com/pzavolinsky/ts-unused-exports) to keep modules encapsulated

### GraphQL: schema-first vs code-first approach

There are two possible approaches to GraphQL API specification: defining schema by hand (schema-first) or auto-generating it from exisiting codebase (code-first). Decision for production grade system would require broader dicussion for the whole developent team as it has large implications for choosing GraphQL server technology, API versioning, etc.

It's my first time implementing GraphQL API so I prefer to use **schema-first approach** to learn the basics properly. Also it seems that schema-first approach is more popular in Node community (more resources available).

Notable mention for code-first approach is [NestJS](https://docs.nestjs.com/graphql/quick-start) framework (which comes with a lot of framework overhead like own dependency injection mechanism). I couldn't find other solutions implementing code-first approach for Node.

### GraphQL: API design

[API definition](src/server/schema/schema.graphql) is rather simple and straightforward, please also see remarks as comments in schema definition. I tried to follow GraphQL best practices like: keeping API use case-oriented, provide separate types for input/output data.

Main problem that I can see in current schema (but won't cover it in this assignment because it's time consuming) is proper **error handling** on API level. Every mutation can result in few distinct types of errors which could be nice to cover on schema level (by providing some generic Either-like result type).

Another flaw of current API is that clients have to implement some basic game logic to prevent these errors. API calls could return next possible actions to take that responsibility off clients (rather overkill for simple game like tic-tac-toe).

My initial thoughts on GraphQL:

- it's use case-oriented which makes easier to implement actions like "create game" and "join game" (in comparison to resource-oriented REST)
- syntax is in fact human-readable
- `!` suffix notation for non-nullable properties/params is weird, `?` suffix for nullable (like in TypeScript, Kotlin) seems more readable

### GraphQL: server technology

Apollo Server is dominating server technology for GraphQL in Node community. I've choosen it to implement the assignment because of availability of resources/extensions and also for simplicity (other tools come with unnecessary overhead).

Notable alternatives:

- [graphql-yoga](https://github.com/prisma-labs/graphql-yoga) - built on top of Apollo Server, comes with a lot more defaults
- previously mentioned [NestJS](https://docs.nestjs.com/graphql/quick-start) with code-first approach, also built on top of Apollo Server

Other GraphQL tools used in this project:

- [graphql-schema-typescript](https://github.com/dangcuuson/graphql-schema-typescript) for generating typesafe resolver types (unfortunatenly it doesn't support `graphql@>=14` yet)

### Logging mechanism

I've implemented simple custom logging mechanism based on built-in `console` that can be extended to more production-ready solution in the future (log level can be adjusted by setting environment variable `LOG_LEVEL=debug|info|warn|error`).

It seems that built-in Apollo Server logging is quite poor (even with `debug` flag set) so I prepared extension for more informative logging.

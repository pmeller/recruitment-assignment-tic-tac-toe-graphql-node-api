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

## How to run

Prerequisites:

- [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- [yarn](https://yarnpkg.com/getting-started/install)

Installing dependencies:

```bash
nvm install
yarn install
```

Running project in development mode with `ts-node`:

```bash
yarn start
```

Running tests (unit and integration):

```bash
yarn test
```

Running linter and typechecking:

```bash
yarn eslint
yarn typecheck
```

Running tests and static analysis at once:

```bash
yarn ci
```

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

### Code structure

I usually try to evolve module structure during project life and to be not overly attached to the current structure. I've created two main directories to prevent coupling between server framework and the rest of code:

- `common` for generic and domain-related modules
- `server` for code related strictly to GraphQL server implementation

In particular I wanted to prevent usage of types that come from GraphQL schema inside `common` which required some acceptable boilerplate.

Main thing that bothers me about production-grade GraphQL API project is how to maintain large schema (which seems to be realistic use case since GraphQL is often used as a facade for other APIs) and related code (like resolvers) but AFAIU it's possible to merge schemas (together with resolvers) using [`graphql-tools`](https://www.apollographql.com/docs/apollo-server/api/graphql-tools/#mergeschemas).

### Logging mechanism

I've implemented simple custom logging mechanism based on built-in `console` that can be extended to more production-ready solution in the future (log level can be adjusted by setting environment variable `LOG_LEVEL=debug|info|warn|error`).

It seems that built-in Apollo Server logging is quite poor (even with `debug` flag set) so I prepared extension for more informative logging.

### Dependency Injection

Simple constructor-based dependency injection mechanism (without IoC container) was implemented which seemed suitable for project of that size. For larger project I opt for [tsyringe](https://github.com/microsoft/tsyringe) with first class support for TS.

### Security

There were no requirements about authentication/authorization so the only one security mechanism is authorizing player's every move with custom token provided when joining a game.

### Tests

Due to limited time I wasn't able to sufficiently cover codebase with tests. I've provided **unit tests** for the most crucial game logic parts (to cover all edge cases).

To ensure that main requirements are fulfilled and catch bugs in the most efficient way I've provided [set of **integration tests**](src/tests/):

- human vs human scenario
- human vs bot scenario
- (extra) bot vs bot scenario

Possible improvements for integration tests:

- splitting into multiple smaller test scenarios (currently they are too large with a lot of assertions in single test)
- providing deterministic bot AI mocks to allow more detailed assertions
- covering also pesimistic scenarios with error handling, invalid moves etc.

## Final thoughts

- I believe I managed to provide solution that covers all requirement with, let's say, good enough quality assurance which was my main goal
- I'm not proud of code quality, especially game logic related modules. In particual `GameManager` class is a bit spaghetti and has too many responsibilities. More time is required to design it more carefully
- Domain-related types/models in `common` are a bit too much similar too GraphQL schema types which made them inconvinient to use during implementation
- Current (in-memory) implementation of game respository handles moves history by simply maintaining array as a game's property. When switching to DB implementation it could require API refactoring and probably [resolvers chain](https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-chains) on GraphQL side
- [Smarter strategy](https://en.wikipedia.org/wiki/Tic-tac-toe#Strategy) for game bot could be implemented but I believe it's not core part of this assignment
- I've implemented GraphQL subscriptions with RxJS to test that possibility and it looks promising (but of course needs further investigation if can be used without memory leaks)

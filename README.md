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
- NPM for package management and scripts
- [ts-node](https://github.com/TypeStrong/ts-node) for local execution environment

Tools to consider for larger codebases:

- [yarn with workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) for working with monorepo
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) for enforcing proper dependency graph
- [ts-unused-imports](https://github.com/pzavolinsky/ts-unused-exports) to keep modules encapsulated

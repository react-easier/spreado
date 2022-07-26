# Contributing to Spreado

## Submission Guidelines

### Submitting an Issue

If you have discovered a bug or have a feature suggestion, please [submit a new issue on GitHub](https://github.com/react-easier/spreado/issues/new).

Also, in case an issue for your problem might already exist, please search the issue tracker first.

### Submitting a Pull Request

To commit changes, please checkout a new branch with a name format `author-name/change-brief` from the latest `main` branch.

On writing commit messages, please follow [conventional commits](https://www.conventionalcommits.org/).

And, on changes done, create a PR with a descriptive title. Once the PR gets approved, you become able to merge it.

On any changes merged into `main` branch, an alpha version will get published and you may just use it for a preliminary trial.

## Local Setup

At spreado, [yarn 1.x](https://classic.yarnpkg.com/) is used to execute commands. By running `yarn` in the root dir of the project, you can have dependencies installed and source code compiled. More preset commands can be found by checking `scripts` field in `package.json` file:

- `yarn build`: compiles source code and checks types.
- `yarn watch`: does the same as `yarn build` but in watch mode.
- `yarn test`: runs tests.
- `yarn coverage`: runs tests with coverage enabled.
- `yarn clean:built`: cleans compilation outputs.
- `yarn clean:coverage`: cleans coverage reports.
- `yarn clean:cache`: cleans generated caches.
- `yarn clean:installed`: cleans installed dependencies.
- `yarn clean`: cleans everything.
- `yarn lint:tsc`: checks types
- `yarn lint:eslint`: checks usages
- `yarn lint:prettier`: checks formats
- `yarn lint:commitlint`: checks commit messages
- `yarn lint`: checks everything

Often, you may keep `yarn watch` running to do compilation and type checking continuously. And you may append a relative path to `yarn test/coverage` to specify which tests to run. Please just make best of commands above to help yourself.

## Codebase Overview

```sh
src
├── core            # Core interfaces and helpers.
├── for-*           # Implementations of SpreadoSetup and implementation-specific exports.
├── redux/mobx/...  # Internal helpers grouped by themes.
├── react           # Hooks and components exported for react specific usages.
└── global.ts       # Utils exported for plain function calls.
```

## Code Of Conduct

Spreado has adopted a Code of Conduct that we expect project participants to adhere to. Please read [the full text](./CODE_OF_CONDUCT.md) so that you can understand what actions will and will not be tolerated.

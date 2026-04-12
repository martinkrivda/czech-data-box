# Contributing

## Development Setup

1. Use Node.js `24.14.1` from [`.nvmrc`](./.nvmrc).
2. Install dependencies with `pnpm install`.
3. Validate your changes with `pnpm verify`.

## Pull Requests

1. Keep the public API, examples, README, and docs in sync with your change.
2. Add a changeset for every user-facing change with `pnpm changeset`.
3. Prefer focused PRs that keep runtime changes and refactors easy to review.

## Code Style

- Strict TypeScript is required.
- Repository automation and workflows use `.yaml` where GitHub permits it.
- Formatting is enforced with Prettier and linting with ESLint.

## Conduct

Please follow the rules in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

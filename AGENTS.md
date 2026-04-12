# AGENTS.md

## Project

`czech-data-box` is a strict TypeScript Node.js library for working with Czech
Data Boxes (ISDS) over SOAP.

The package currently covers:

- login with username/password
- login with PKCS#12 certificate data
- data-box search
- owner info lookup
- password info lookup
- message creation with attachments

The goal is a small, stable, typed public API for Node consumers. Prefer
shipping predictable library behavior over adding broad abstractions.

## Architecture

Keep code split by responsibility:

- `src/lib/`: transport and service orchestration
- `src/models/`: request payload builders and small domain objects
- `src/types.ts`: exported public/shared types
- `resources/`: bundled WSDLs and certificate authorities required at runtime
- `test/`: Vitest unit tests
- `examples/`: runnable smoke examples that import from `dist/`
- `docs/`: development and release instructions

Important boundaries:

- keep SOAP transport details in `src/lib/ISDSSoapClient.ts`
- keep ISDS workflow orchestration in `src/lib/ISDSBox.ts`
- keep payload shaping logic in `src/models/`
- do not move runtime-critical WSDL or CA assets out of `resources/` without
  updating packaging and path resolution

## Package Constraints

- TypeScript is strict and must stay strict
- ESM is the package default
- emitted artifacts live in `dist/`
- runtime dependencies should stay minimal
- public exports must remain explicit and typed
- examples should continue to work against the built package, not source-only imports

## Development Commands

- `pnpm install`: install dependencies
- `pnpm lint`: ESLint
- `pnpm typecheck`: strict TypeScript check without emit
- `pnpm test`: Vitest
- `pnpm test:watch`: Vitest watch mode
- `pnpm build`: compile library to `dist/`
- `pnpm test:package`: create a consumer-like tarball smoke artifact
- `pnpm verify`: lint + typecheck + test + build
- `pnpm changeset`: create a release note for user-facing changes

## Implementation Guidelines

- keep the public API additive and backward compatible unless a breaking change is intentional
- prefer small typed helpers over large dynamic objects
- normalize unknown errors into real `Error` instances before rethrowing
- add or update tests for every behavior change
- keep examples aligned with the current API surface
- update `README.md` and `docs/` when install, usage, or release workflow changes
- use `.yaml` for YAML files where supported in this repository
- keep GitHub-specific required filenames as-is when the platform expects `.yml`

## Testing Strategy

For this repository, the best feedback loop is:

1. unit tests in Vitest
2. strict typecheck
3. package smoke test via `pnpm test:package`

Do not introduce Storybook-style tooling unless the repository grows an actual
UI surface. This is an infrastructure/library package, so packaging and runtime
correctness matter more than component preview tooling.

## Release Rules

- every user-facing change should include a changeset
- versioning follows SemVer through Changesets
- `CHANGELOG.md` is generated from changeset summaries
- GitHub Actions handles CI and npm release from `main`
- if publishing behavior changes, update `.github/workflows/` and `docs/releasing.md`

## Before Finishing Work

Run, at minimum:

```bash
pnpm verify
```

If packaging behavior changed, also run:

```bash
pnpm test:package
```

# Development

## Toolchain

- Node.js `24.14.1`
- pnpm `10.33.0`
- strict TypeScript
- Vitest for automated tests
- bundled WSDL/XSD snapshots from the 2025 ISDS technical appendices
- SOAP 1.2 support for `dm_arch` and `dm_VoDZ`

## First Run

```bash
nvm use
pnpm install
pnpm verify
```

## Daily Commands

- `pnpm lint` runs ESLint.
- `pnpm typecheck` runs strict TypeScript checks without emitting files.
- `pnpm test` runs Vitest once.
- `pnpm test:watch` runs Vitest in watch mode.
- `pnpm build` emits the package into `dist/`.

## Local Package Testing

For a library like this, a Storybook-style environment is not the right primary
tool. The package is not UI-driven, so the highest-value feedback loop is:

1. strict typecheck
2. fast unit tests with Vitest
3. packaging smoke test from the generated tarball

Create a tarball exactly as consumers will receive it:

```bash
pnpm test:package
```

This writes a tarball to `.tmp/pack/`. You can then install it into another
project or scratch folder:

```bash
pnpm add ../czech-data-box/.tmp/pack/czech-data-box-<version>.tgz
```

## Runnable Examples

The files in [`examples/`](../examples) import from `dist/`, so build first:

```bash
pnpm build
node examples/db_search.mjs
```

For real ISDS integration testing, use test credentials and prefer the ISDS test
environment (`productionMode = false`).

## Updating ISDS Definitions

When DIA publishes new technical appendices:

1. compare the provided `WSDL` and `XSD` files with `resources/wsdl/`
2. replace the runtime snapshots used by the library
3. update any exposed wrapper methods if new operations should be supported
4. run `pnpm verify`

The operational rules currently document four supported endpoint modes:

- `basic`
- `cert`
- `certds`
- `hspis`

See also:

- [Mailroom guide](./mailroom.md)

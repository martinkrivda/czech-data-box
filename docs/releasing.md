# Releasing

## Release Flow

1. Add a changeset with `pnpm changeset`.
2. Merge the change into `main`.
3. The release workflow opens or updates a Changesets release PR.
4. Merging that PR updates package versions and `CHANGELOG.md`.
5. The next push to `main` publishes to npm only when a new version exists.

## Notes

- `CHANGELOG.md` is generated from changeset summaries.
- The workflow expects `NPM_TOKEN` to be available in repository secrets.
- If there is no pending version bump, the release workflow exits without
  publishing.

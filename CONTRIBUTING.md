# Contributing

```bash
yarn install
yarn lint && yarn typecheck && yarn test
twenty app build
```

Releases: bump `version` in `package.json`, add a `CHANGELOG.md` entry, and push a `vX.Y.Z` tag. The Publish workflow publishes to npm with provenance. `README.md` is the marketplace About tab, so keep it user-facing.

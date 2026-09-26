# Verification

GitHub Actions runs the following checks on pushes to `main` and on pull requests:

```bash
npm install
npm run contracts:compile
npm run contracts:test
npm run build
```

The CI workflow intentionally avoids npm dependency caching until a lockfile is committed.

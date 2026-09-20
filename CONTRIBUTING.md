# Contributing

Contributions that keep the extension focused on selecting, annotating, and referencing AI chat passages are welcome.

## Development

```bash
npm ci
npm run check
npx playwright install chromium
npm run test:e2e
```

Provider-specific DOM behavior belongs in `src/adapters`. Shared collection, annotation, formatting, and send behavior belongs in `src/core` and `src/ui`.

Do not include real private conversations in tests, screenshots, issues, or pull requests. Use synthetic fixtures.

Before opening a pull request, ensure `npm run check` and `npm run test:e2e` pass.

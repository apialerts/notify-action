# Release Process

## Files to update

1. `src/run.ts` — update `VERSION` constant
2. `package.json` — update `version` field
3. Run `npm install` and `npm run build` to rebuild `dist/index.js`
4. Commit and PR to `main`

## Tagging

After merging to `main`, create and push a version tag:

```bash
git tag v1.4.0
git push origin v1.4.0
```

The `publish.yml` workflow will automatically update the floating `v1` tag to point to the same commit.

Users can pin to any level of specificity:

```yaml
uses: apialerts/notify-action@v1        # always latest 1.x
uses: apialerts/notify-action@v1.4.0   # exact version
```

## Important

The compiled `dist/index.js` **must be committed** — GitHub Actions runs it directly without a build step. The `build-release.yml` workflow handles this automatically on every merge to `main`.

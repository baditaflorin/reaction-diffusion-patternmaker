# Deploy

Live site: https://baditaflorin.github.io/reaction-diffusion-patternmaker/

This project publishes from the `main` branch `/docs` folder using GitHub Pages.

## Publish

```bash
make build
git add .
git commit -m "chore: publish pages build"
git push origin main
```

GitHub Pages then serves the committed `docs/index.html` and hashed assets in `docs/assets/`.

## Rollback

Revert the publishing commit and push `main` again.

## Custom Domain

If a custom domain is added later, place a `CNAME` file in `docs/` and configure DNS with the provider.

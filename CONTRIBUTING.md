# Contributing

Thanks for improving Reaction Diffusion Patternmaker.

## Local Setup

```bash
npm install
make install-hooks
make dev
```

Before opening a pull request, run:

```bash
make fmt
make lint
make test
make build
make smoke
```

Commits should use Conventional Commits, for example `feat: add coral preset` or `fix: stabilize export scaling`.

No secrets belong in this repository. Use `.env.example` for placeholders only.

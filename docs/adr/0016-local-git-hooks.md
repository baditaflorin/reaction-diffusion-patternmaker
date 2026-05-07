# 0016 Local Git Hooks

## Status

Accepted

## Context

The bootstrap forbids GitHub Actions and requires local hooks.

## Decision

Use plain `.githooks/` wired by `make install-hooks`.

Hooks:

- `pre-commit`: format check, lint, typecheck, tests, and `gitleaks protect --staged` when available.
- `commit-msg`: Conventional Commits validation.
- `pre-push`: `make test`, `make build`, and `make smoke`.
- `post-merge` and `post-checkout`: regenerate build metadata.

## Consequences

- Contributors keep checks local.
- Missing optional CLIs are documented rather than vendored.

## Alternatives Considered

- lefthook. Rejected to avoid an extra hook framework dependency.
- GitHub Actions. Rejected by constraint.

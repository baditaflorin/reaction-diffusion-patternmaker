# 0015 Deployment Topology

## Status

Accepted

## Context

Mode C topology would require Docker Compose, nginx, metrics, and server deployment. ADR 0001 selected Mode A.

## Decision

Use GitHub Pages only.

There is no `deploy/` directory, Docker Compose stack, nginx config, Prometheus endpoint, or GHCR image for v1.

## Consequences

- Deployment is a `git push` to `main`.
- Rollback is a git revert.
- Server resource sizing and backups are not applicable.

## Alternatives Considered

- Add a no-op deployment folder. Rejected because it would confuse operators.

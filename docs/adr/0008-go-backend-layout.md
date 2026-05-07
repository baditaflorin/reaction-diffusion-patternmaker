# 0008 Go Backend Layout

## Status

Accepted

## Context

The bootstrap includes Go backend requirements for Mode B and Mode C.

## Decision

Skip Go backend scaffolding in v1 because ADR 0001 selected Mode A.

No `cmd/`, `internal/`, `pkg/`, `api/`, Dockerfile, or runtime server code is created.

## Consequences

- The repository stays focused on the browser app.
- There is no server health endpoint, metrics endpoint, or Docker image.
- Future runtime or generation needs must introduce their own ADR before adding Go.

## Alternatives Considered

- Create empty Go folders. Rejected because it implies a backend that does not exist.

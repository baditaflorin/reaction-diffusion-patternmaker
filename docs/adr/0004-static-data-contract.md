# 0004 Static Data Contract

## Status

Accepted

## Context

Mode A has no generated data pipeline, but presets and metadata still need a stable internal contract.

## Decision

Store presets in TypeScript modules validated with zod during tests.

Preset schema version: `v1`.

Each preset includes:

- `id`
- `name`
- `description`
- `feed`
- `kill`
- `diffusionU`
- `diffusionV`
- `timeStep`
- `seed`
- `palette`

Future static JSON data, if needed, will live under `docs/data/v1/` with sibling `*.meta.json` files.

## Consequences

- v1 avoids unnecessary fetches for tiny static data.
- Tests can enforce preset ranges and unique IDs.
- A future Mode B data pipeline can reuse the documented schema.

## Alternatives Considered

- Runtime API for presets. Rejected because presets are static and public.
- JSON files fetched at runtime. Deferred until preset packs or user-shareable catalogs justify it.

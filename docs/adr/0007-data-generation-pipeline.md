# 0007 Data Generation Pipeline

## Status

Accepted

## Context

Mode B would require an offline data-generation pipeline. ADR 0001 selected Mode A.

## Decision

No data-generation pipeline is built in v1.

The `make data` target is intentionally absent. Static presets are committed source.

## Consequences

- No scheduled job, generated artifact contract, or Release-hosted dataset is needed.
- If future preset packs, reference textures, or benchmark datasets become large, this ADR should be superseded by a Mode B-specific ADR.

## Alternatives Considered

- Add a placeholder Go data generator. Rejected because unused scaffolding creates maintenance burden.

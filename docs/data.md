# Data Contract

This Mode A project has no generated data pipeline.

Static v1 preset data lives in `src/features/patterns/presets.ts` and is validated by zod-powered tests.

Future JSON artifacts, if introduced, should use:

- path: `docs/data/v1/<artifact>.json`
- metadata: `docs/data/v1/<artifact>.meta.json`
- schema version: `v1`
- deterministic key ordering
- no secrets

The frontend must tie cache keys to the schema version.

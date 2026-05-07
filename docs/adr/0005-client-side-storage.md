# 0005 Client-Side Storage Strategy

## Status

Accepted

## Context

The app should remember user settings without accounts or a backend.

## Decision

Use `localStorage` for lightweight settings:

- selected preset
- resolution
- speed
- palette
- audio enabled state
- last parameter edits

Exported textures are downloaded by the browser and are not stored by the app.

IndexedDB and OPFS are deferred until v1 needs large saved sessions or batch exports.

## Consequences

- State persists across reloads on one device.
- No personal data is transmitted.
- Users can reset state by clearing browser site data.

## Alternatives Considered

- IndexedDB. More complex than needed for v1 settings.
- Server-side profiles. Rejected by ADR 0001.

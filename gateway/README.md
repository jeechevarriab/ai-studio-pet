# Future companion gateway — design only

Phase 1 uses synthetic controls only. There is no gateway process, listener, authentication token or connection to the AI STUDIO runtime.

Existing hub inspection found /api/health for a minimal health report and /api/state for a broad dashboard state that includes task/conversation context. Do not send /api/state wholesale to this project or an ESP32. The existing native knowledge helper rejects unregistered chats; do not borrow another agent identity or credential.

A separately approved implementation should expose an authenticated, read-only, size-bounded allowlist. Proposed response: schemaVersion, observedAt and exactly the five existing role IDs with a status enum (unknown, idle, working, attention). Exclude task text, file paths, user messages, documents, executable commands and tokens. Reject unknown fields/roles/status values, stale/replayed data and oversized responses. Define expiration, revocation, transport and permitted network scope before implementation. Treat upstream strings as data, never commands.

No backend role registration, sixth dashboard card, Manager delegation, studio event publication or shared knowledge permission change is included in Phase 1.

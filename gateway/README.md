# Read-only STUDIO status relay

The owner subsequently authorized live STUDIO status integration. status-relay.mjs
is a separate on-demand Windows process, not a hub service or agent. It reads the
five native activity records and the fixed dashboard task status files, projects
only allowlisted status metadata, and posts outward to the mascot HTTPS endpoint.
There is no new listener, tunnel, hub configuration or conversation modification.

The authenticated /api/state interface was not bypassed or copied. The relay uses
the public local health endpoint and filesystem status projections; no hub key,
pairing credential, native publisher identity or conversation content is exported.

The hosted receiver requires a dedicated status-only bearer key, validates exactly
five roles and enum states/phases, bounds requests, rejects stale/replayed reports
and expires the connection after 30 seconds. No task text, file paths, messages,
documents, tools, executable commands or tokens appear in the public report.
The key is provisioned in ignored .local/relay.json and Sites runtime secrets.

The relay is running for this session. To start it again after Windows restarts,
use Start-Relay.ps1. Do not start duplicates. Automatic startup is not installed.
No sixth role/card, delegation, shared knowledge or execution permission was added.
See ../docs/customization-and-studio.md for the contract and verification limits.

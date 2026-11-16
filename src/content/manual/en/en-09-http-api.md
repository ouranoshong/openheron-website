---
title: "HTTP API reference"
chapter: "9"
order: 9
chapterSlug: "http-api"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

The service exposes only the `/v2` family. ★ The default listener is the **loopback**
(`127.0.0.1:8080`), so only this machine can reach it, and there is no CORS.

★ **There is no account and no token.** This is a single-user tool on one machine: the
address is the whole boundary. Exposing it — `listen_addr: 0.0.0.0:8080`, or a reverse
proxy in front — is a decision you write down, and the server says so on the terminal at
startup.

★ Two rules hold whatever the address is. A request that **changes** something and
comes from another site is refused. And while the listener is on the loopback, a
request whose **Host** is not this machine is refused — a page on another site can
point a browser at `127.0.0.1`, and then the request would otherwise look like it came
from here. Both answers are `403`.

| Method | Path | Effect |
|---|---|---|
| POST | `/v2/sessions` | Create a session; returns `threadId` |
| GET | `/v2/sessions` | List sessions |
| GET | `/v2/sessions/:id` | Session details |
| PATCH | `/v2/sessions/:id` | Rename the session |
| PATCH | `/v2/sessions/:id/agent` | Change the session's agent |
| DELETE | `/v2/sessions/:id` | Delete the session |
| GET | `/v2/sessions/:id/messages` | History + usage (filter with `?agent=`) |
| GET | `/v2/sessions/:id/events` | The session's **announcement channel** — an SSE stream of the facts that belong to the session, not to a round (§6.7) |
| GET | `/v2/sessions/:id/runs` | The run ledger: every run of the session + the active one |
| GET | `/v2/sessions/:id/runs/:runId` | One run of the session |
| POST | `/v2/sessions/:id/abort` | Abort the running turn |
| POST | `/v2/sessions/:id/compact` | Compact the conversation now (see §6.6) |
| POST/GET | `/v2/sessions/:id/files` | Upload / list session workspace files (32 MiB per file) |
| GET | `/v2/sessions/:id/files/raw` | The bytes of one workspace file — what the preview opens |
| DELETE | `/v2/sessions/:id/files` | Delete one workspace file |
| GET | `/v2/project/files` | List files under a project root (`?q=` `?limit=` `?project=`) |
| GET | `/v2/projects` | The project table and the scope of this process (`{items, scope}`) |
| POST | `/v2/projects` | Register a project (`{"name": "…", "root": "…"}`) |
| PATCH | `/v2/projects/:id` | Rename a project, move it, or reorder it |
| DELETE | `/v2/projects/:id` | Remove a project — its conversations fall back to "no project" |
| POST | `/v2/fs/pick-directory` | Open the system's folder chooser on the server's machine (`{"start": "…"}`) |
| GET | `/v2/commands` | The slash-command list |
| POST | `/v2/run` | **SSE entry point**: ask a question, or answer an approval (see §6.7) |
| GET | `/v2/skills` | The skill list |
| GET | `/v2/agents` `/v2/agents/:agentId` | Agents and their effective tool tables |
| GET | `/v2/mcps` | The MCP servers of one agent (`?agent=`); see §6.8 |
| GET | `/v2/config` | The effective configuration (its `policy` field carries the default tier and the names that run without a nod) |
| GET | `/v2/health` | Health check (includes `deferred` notices) |
| GET | `/v2/runtime` | Runtime status |
| GET | `/v2/settings` | The list of editable items |
| GET/POST/PUT/DELETE | `/v2/settings/item` | Read/write config (carries `baseRevision`) |
| POST | `/v2/settings/validate` | Validate a configuration without writing it |
| GET | `/v2/secrets` | The two namespaces and where each key is (§6.3) |
| PUT | `/v2/secrets/:group/:name` | Store one key in the keyring (`{"value":"..."}`) |
| DELETE | `/v2/secrets/:group/:name` | Remove one key |
| DELETE | `/v2/secrets/:group` | Remove every key of that group |

## 9.1 Running a turn

```bash
# 1. Create a session
curl -s -X POST localhost:8080/v2/sessions \
  -H 'content-type: application/json' -d '{"agentId":"main"}'
# → {"threadId":"...","state":"idle",...}

# 2. Ask (SSE stream)
curl -N -X POST localhost:8080/v2/run \
  -H 'content-type: application/json' \
  -d '{"threadId":"<the id from step 1>","query":"read the README"}'
```

★ **`threadId` is required.** Without it you get
`threadId is required; create the session with POST /v2/sessions first`.

★ **A session runs one turn at a time.** A second request on a session that is already
running gets `409` with the code `session_busy` — and the running turn is not disturbed
(see §6.7).

The response is an **AG-UI event stream**, with event types `RUN_STARTED`,
`TEXT_MESSAGE_*`, `REASONING_*`, `TOOL_CALL_*`, `CUSTOM` (`model_retry`),
`RUN_FINISHED` and `RUN_ERROR`. A sub-agent's output is attributed through
`subagentRunId` on the event.

## 9.2 Answering an approval

The decision goes back into the **same** `/v2/run`:

```json
{
  "threadId": "...",
  "resume": [
    {"interruptId": "...", "payload": {"approved": true}},
    {"interruptId": "...", "payload": {"approved": false, "reason": "do not touch that file"}}
  ]
}
```

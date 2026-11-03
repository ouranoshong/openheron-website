---
title: "HTTP API reference"
chapter: "9"
order: 9
chapterSlug: "http-api"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

The service exposes only the `/v2` family. There is no authentication and no CORS; the
default `:8080` binds every interface, so put a reverse proxy in front to expose it
publicly, or narrow `listen_addr` to `127.0.0.1`.

| Method | Path | Effect |
|---|---|---|
| POST | `/v2/sessions` | Create a session; returns `threadId` |
| GET | `/v2/sessions` | List sessions |
| GET | `/v2/sessions/:id` | Session details |
| PATCH | `/v2/sessions/:id` | Rename the session |
| PATCH | `/v2/sessions/:id/agent` | Change the session's agent |
| DELETE | `/v2/sessions/:id` | Delete the session |
| GET | `/v2/sessions/:id/messages` | History + usage (filter with `?agent=`) |
| GET | `/v2/sessions/:id/runs` | The run ledger: every run of the session + the active one |
| GET | `/v2/sessions/:id/runs/:runId` | One run of the session |
| POST | `/v2/sessions/:id/abort` | Abort the running turn |
| POST | `/v2/sessions/:id/compact` | Compact the conversation now (see §6.6) |
| POST/GET | `/v2/sessions/:id/files` | Upload / list session workspace files (32 MiB per file) |
| GET | `/v2/project/files` | List files under the project root (`?q=` `?limit=`) |
| GET | `/v2/commands` | The slash-command list |
| POST | `/v2/run` | **SSE entry point**: ask a question, or answer an approval (see §6.7) |
| GET | `/v2/skills` | The skill list |
| GET | `/v2/agents` `/v2/agents/:agentId` | Agents and their effective tool tables |
| GET | `/v2/config` | The effective configuration |
| GET | `/v2/health` | Health check (includes `deferred` notices) |
| GET | `/v2/runtime` | Runtime status |
| GET | `/v2/settings` | The list of editable items |
| GET/POST/PUT/DELETE | `/v2/settings/item` | Read/write config (carries `baseRevision`) |
| POST | `/v2/settings/validate` | Validate a configuration without writing it |

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

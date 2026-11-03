---
title: "Using the interface"
chapter: "6"
order: 6
chapterSlug: "interface"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

| Element | What it does |
|---|---|
| **Sidebar** | Session list, agent filter, status dot (lights up when an approval is pending) |
| **Composer** | Ask a question; `/` opens the slash commands; supports drag/paste attachments |
| **Message list** | Assistant replies, reasoning, tool-call cards, sub-agent output (with attribution) |
| **Approval card** | Appears when your nod is needed: approve / deny (with an optional reason) |
| **Tool card** | The arguments and result of each tool call |
| **Settings** | Entry point to the config editor |

## 6.1 Slash commands

| Command | Effect |
|---|---|
| `/new` | Start a new session |
| `/stop` | Stop the current turn |
| `/attach` | Attach files to the current session |
| `/settings` | Open the config editor |
| `/agents` | Switch the session's agent |
| `/compact` | **Compact the conversation now** — see §6.6 |
| `/skill` | Pick a named skill for this task |
| `/review` | Review the current changes or the given paths |
| `/test` | Run the relevant tests and summarise failures |
| `/explain` | Explain how the given code works |
| `/fix` | Find the root cause and fix the given problem |

## 6.2 How an approval goes

When the model wants to call an `ask`-tier tool:

1. The run **pauses** and an approval card appears.
2. You approve or deny; a denial can carry a one-line reason.
3. The decision is written back to the session and the model continues with the result.

★ On denial the model receives **a denial message** (with your reason), **not** an
error — so it can adjust its approach instead of falling over.

★ The approval's resume point is stored in the session. **If that resume point is lost**
(e.g. the session directory was cleaned out), the interface tells you plainly that the
approval can no longer be resumed and asks you to send a new message, instead of
silently starting a fresh turn.

## 6.3 The config editor

`/settings` opens it. It can edit `llm/`, `agents/`, `policy/` and `tools/`.

The write path has several gates:

- `server/` is **not editable** (not hot-reloaded, so a change needs a restart).
- **Literal secrets are rejected** — `api_key must be a reference, not a literal`. Use
  `${ENV_VAR}` or `@file:/path`.
- **A file with no YAML content is rejected** — a file that is empty, or holds nothing
  but comments, carries no configuration at all. The message names the fields the file
  needs; under `tools/` it says which tool is missing what.
- **Optimistic concurrency**: if the file changed elsewhere, saving reports a conflict
  and lets you choose to overwrite or to back off.

## 6.4 The context meter

The line under the input box ends with the **context occupancy** of the agent you are talking
to:

```
Agent: main · deepseek/deepseek-flash · Reasoning: off · Context: ≈18k / 131k (14 %)
```

- The number is the size of that agent's **most recent request** — not a total over the
  conversation. A long conversation can have spent a lot and still have plenty of room.
- It is the vendor's own count, so it is an estimate: the `≈` is there on purpose.
- The bar turns amber at 80 % of the window and red at 95 %.
- If the model declares **no** context window, the meter shows the token count alone
  (`Context: ≈18k tokens`) and no ratio. Declare `context_window` in
  `llm/<vendor>.yaml` to get the bar.

When several agents are in play, each one gets its own figure in the **agent filter** above
the conversation — every agent has its own context, and they are rarely the same size.

★ The occupancy and the agent's **spend** are different numbers. The meter is about room left
in the context; the spend is about what the agent has cost you over the whole session.

## 6.5 The compaction divider

When the context is compacted, the conversation gets a **divider**:

```
────────────  12 earlier messages · compacted into a summary · ≈62k tokens saved  ────────────
```

- The divider marks the **boundary of what the model reads**. Above it, the agent reads a
  summary; the messages themselves are not sent any more.
- The messages stay in the transcript and stay readable — compaction shortens the
  **context**, not the **record**. Scroll up and the conversation before the cut is still
  there.
- The counts are estimates: `≈62k` is the vendor's own token count minus the size of the
  summary, and it says how much room the cut bought.
- A compaction that happens **during** a run draws the divider at once, without the
  counts: the counts are measured against the transcript, which is written when the run
  ends. Reload the thread and they are there.

★ The summary itself is not shown. It is the model's working material, not your
conversation — and the messages it replaces are still on screen.

## 6.6 `/compact` — compacting on demand

The context is compacted **by itself** when it reaches the agent's threshold (see §4.1). `/compact`
does the same thing **when you say so**: it summarizes the conversation and makes that summary the
new boundary, right away.

```
/compact
```

- It costs **one model call** — the summary is generated the same way the automatic compaction
  generates it, by the agent's own model.
- It is **independent of the threshold**. An agent that never compacts by itself (`summarize_at: 0`)
  can still be compacted by hand: "off" means "do not do it on your own", not "you may not".
- The divider appears when it is done, with the counts. While it runs, the composer says
  `Compacting the conversation…`.
- The messages above the divider stay readable — compaction shortens the **context**, not the
  **record**.

★ **It refuses a context that is too small to be worth compressing.** A summary carries a preamble
and your own messages, so a short conversation can come out *longer* than it went in. Below four
messages, or below roughly 4k tokens of context, `/compact` says there is nothing worth
compacting yet and changes nothing.

★ **It refuses while a turn is running or an approval is waiting.** Both own the context: cutting
the history under them would be cutting the history they are working with. Stop the turn first.

The same thing is available over HTTP — `POST /v2/sessions/{id}/compact` — for scripts.

## 6.7 Two windows on one session

A session runs **one turn at a time**. If the same session is open in two windows — two
tabs, or a tab and another machine — only one of them can be running a turn.

The other one says so:

```
This session is running in another window — stop it to take over
```

★ **Nothing is lost.** The refused message is not sent, so it does not appear in the
conversation. The turn that is running keeps going, untouched.

★ **The stop button is the way to take over.** It stops the session's turn — whoever
owns it — and then you can send. The window that owned the turn sees it stop.

★ **This is a server-side rule, not a browser one.** Any client that talks to the API
gets the same answer, and the session's `state` reports `"running"` to every client
looking at it. A second window opened while a turn is running hydrates as busy, with the
send button already disabled.

★ **A broken connection does not lose the turn.** The turn belongs to the server, not
to the connection that happened to be watching it: the server archives it either way.
A client whose connection drops comes back with the run's id — `POST /v2/run` with
`runId` and **no question** — and gets the rest of the turn. `GET
/v2/sessions/{id}/runs` says whether the run is still going, and the run's own history
is there for the times when it is not.

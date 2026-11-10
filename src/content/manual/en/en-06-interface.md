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
| **Header** | The agent filter (each chip names an agent; hover it for its context occupancy and spend), the theme switch, and the status of the current turn |
| **Sidebar** | The session list, the "New thread" button, the settings entry |
| **Composer** | Ask a question; `/` opens the slash commands; supports drag/paste attachments |
| **Message list** | Assistant replies, reasoning, tool-call cards, sub-agent output (with attribution) |
| **Approval card** | Appears when your nod is needed: approve / deny (with an optional reason) |
| **Tool card** | The arguments and result of each tool call |
| **Settings** | Entry point to the config editor |

★ The **theme switch** is in the header: light or dark. It follows your desktop until you
pick one, and the choice is remembered.
★ A **table** in a reply has a width of its own: it fills the column, a long cell wraps
inside it, and a table with many columns scrolls inside its own frame instead of pushing
the page sideways.

## 6.1 Slash commands

| Command | Effect |
|---|---|
| `/new` | Start a new session |
| `/stop` | Stop the current turn |
| `/attach` | Attach files to the **next** message — see §6.9 |
| `/settings` | Open the config editor |
| `/agents` | Switch the session's agent |
| `/mcps` | Show the MCP servers of this agent — see §6.8 |
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

`/settings` opens it. It can edit `llm/`, `agents/`, `tools/` and `mcps/`.

The write path has several gates:

- **Nothing is checked in the browser any more.** The editor sends the draft to the
  server and shows the server's answer — each issue with the line it is on. Typing is
  debounced by 250 ms, and an answer that belongs to an older draft is dropped.
- **Every issue names the file it is about.** A problem in another file is shown under
  **that** file's name — and it is a link: click it and the editor opens that file. Your
  own file's problems stay on your own file. ★ A file that does not even parse still takes
  the whole tree with it, so a broken file elsewhere still blocks the save; the status
  line says which file is the reason.
- **A grey line is a hint, a red line is an error.** A hint says "this tree is short
  something" and does not block anything; an error is what keeps Save disabled. An agent
  whose model is not declared is a **hint** on that agent's own file: the tree loads
  without it (see §4.1), so the file in front of you can be perfectly fine.
- **A change that would take a working agent out of the tree is refused.** Repointing an
  agent at a model nobody declares would otherwise make it disappear without a word. The
  refusal is shown on the file you are editing — that is the change being made — and Save
  stays disabled until the agent is back in the tree. Adding an agent, or editing
  something unrelated, is never refused this way.
- **A delete that something still names is refused, and the refusal names the referrer.**
  Deleting `mcps/fetch.yaml` while an agent still mounts it would leave that agent
  pointing at a server that is not there. The message says **which file still names it**
  and **what to remove** — remove that reference first, then delete the file. The same
  goes for a model profile an agent uses and for an agent another agent delegates to.
- `server/` is **not editable** (not hot-reloaded, so a change needs a restart).
- **Literal secrets are rejected** — `api_key must be a reference, not a literal`. Use
  `${ENV_VAR}` or `@file:/path`.
- **A file with no YAML content is rejected** — a file that is empty, or holds nothing
  but comments, carries no configuration at all. The message names the fields the file
  needs; under `tools/` it says which tool is missing what.
- **A file under `mcps/` must be named `<server>.yaml`**, and the server name must match
  the pattern of §4.7 — any other name is refused at save time.
- **Optimistic concurrency**: if the file changed elsewhere, saving reports a conflict
  and lets you choose to overwrite or to back off.
- **A new file whose name the server refuses keeps the dialog open**, with what you typed
  still there and the server's sentence beside the field — the file name rules are the
  server's (`server/` is read-only, `tools/` takes five names, `mcps/` takes
  `<server>.yaml`), so the refusal comes back from the server, not from a copy in the
  dialog.

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

## 6.8 `/mcps` — the MCP servers of this agent

`/mcps` is an **action**, not a prompt: it opens a dialog, and it never writes into the
transcript and never reaches the model. The status is **read**, not generated — a model
describing the servers would be a second, lossy truth about a fact the runtime already
holds.

The dialog is titled "MCP servers" and holds one block per configured server:

- the server's name, its transport (`stdio` or `http`), and its state — `ready`,
  `starting`, `unreachable` or `unused`;
- one row per tool: the server's own name, the exposed name (`mcp__github__create_issue`),
  the tier (`allow` or `ask`), and the state.

A configuration with no server says "No MCP servers are configured".

★ **Opening the dialog starts the servers it asks about**, so it can answer "is my server
broken?" — otherwise the answer would be "run a turn and find out". A server the agent
does not use is `unused` and carries no tool rows.

★ **A server that cannot start does not stop the turn.** The agent runs without that
server's tools — the rest of the tool surface is unaffected — and the panel carries the
reason next to the server. The only thing a broken server costs you is its own tools.

★ **A server on its way is a state of its own: `starting`.** The servers are started in
the background as soon as the configuration is known, so the first turn usually finds
them up. A server that is still starting says `starting` and carries **no error** —
there is no error yet, it is on its way. The tools it brings join the **next** turn.

The **Refresh** button re-reads the state, so you can fix a server and see the fix without
closing the dialog.

## 6.9 Sending attachments

Three ways in, and they all end in the same place — a row of chips above the composer:

| How | What happens |
|---|---|
| The **paperclip** button | Opens the file picker |
| **Dragging** files onto the composer | The composer highlights while the drag is over it |
| **Pasting** | Ctrl+V with an image on the clipboard attaches it — no "save it as a file first" |

★ **A file is attached to a *message*, not to a session.** The chips above the
composer are waiting to go out with your **next** message; once you send, they
leave the composer and appear on the message itself. A file that has been sent
stays with that message — you can still see which one it was weeks later, after
a reload.

★ **The model really gets them — by opening them.** A picture goes in as an
image, so the model *sees* it rather than reading bytes as text. ★ Any other
text file is named by an `@` line at the top of the message, holding an
absolute path; the model calls `read_file` on it. The file's bytes are not in
the request, so the first thing the model does is open the file — for a large
one it reads in chunks with `offset` and `limit`. ★ A binary attachment (a
PDF, an archive) is named in the prompt as "cannot be processed yet": the
model tells you so instead of pretending it read it.
★ **There is no automatic fallback.** A picture the model cannot see fails the
turn with the provider's error; a file the model did not open is not re-sent
behind your back. If an answer looks like the file was never read, tell the
model to read it again.

★ **Accepting a picture is not the same as seeing it.** Whether a picture reaches
the model's eyes is the provider's business: some models read it, some take the
request and never look at it — DeepSeek's `deepseek-v4-pro` does the latter. ★
When that happens the model says so itself; openheron cannot declare a model's
vision in the configuration, so it does not pretend to know.

★ **The × on a chip deletes the file.** Not just from the list: the file is
removed from the session's workspace as well. ★ A file that already went out
with a message is **not** deleted — that message says the file was part of the
question, and deleting it would make the record lie.

★ **You can look at a file before you send it, and after.** A picture shows as
a thumbnail on its chip; everything else shows the icon of its kind. Click it
and the file opens in place: the picture at full size, a PDF in the reader, a
Markdown file rendered, code highlighted, text as text. ★ The same works on
the attachments in the messages above — those are history, so they have no
×, but they open just the same. ★ A file that is gone (deleted with the ×, or
cleaned out of the workspace) falls back to its icon instead of a broken image.

★ **A picture is compressed on the way in.** It keeps its format — a PNG
stays a PNG, with its transparency — and it is scaled down when it is larger
than 1600 pixels on its longest edge. ★ A GIF and a WebP are stored as they
are: the first would lose its animation, and the second cannot be re-encoded
here. ★ The file's **name** in the workspace carries a short hash, so
uploading the same name twice gives two files instead of one overwriting the
other — and the interface still shows you the name you recognise.

★ **A reload does not lose anything.** The files you have not sent yet come
back (the server keeps them), and the files you already sent stay on their
messages.

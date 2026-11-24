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
| **Header** | The agent filter (each chip names an agent; hover it for its context occupancy and spend), the theme switch, the language switch, and the status of the current turn |
| **Sidebar** | The session list — grouped by project — the "New thread" button and the settings entry |
| **Composer** | Ask a question; `/` opens the slash commands; supports drag/paste attachments |
| **Message list** | Assistant replies, reasoning, tool-call cards, sub-agent output (with attribution) |
| **Approval card** | Appears when your nod is needed: approve / deny (with an optional reason) |
| **Tool card** | The arguments and result of each tool call |
| **Tool group** | Calls that follow each other, gathered into one line; open it for the steps |
| **Settings** | Entry point to the config editor |

★ The **theme switch** is in the header: light or dark. It follows your desktop until you
pick one, and the choice is remembered.
★ The **language switch** is next to it: the interface follows your browser's language until
you pick one, and the choice is remembered on this machine. ★ A sentence that has no
translation yet is shown in English rather than left blank.
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
| `/agents` | Switch the session's agent — clicking the agent's name under the input box opens the same picker |
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

★ **The round comes back to the tree it started with.** A round that was interrupted for
an approval records the tree it ran on, and the resume continues on that tree — so a
configuration change made in the meantime does not change what that round concludes.
The change takes effect on the **next** round (§4.9). ★ If openheron was restarted in
the meantime, that tree is gone: the round continues on the current one, and the log
says so.

★ **A second window on the same session keeps up.** If the approval is answered in one
window, the other window's card disappears on its own and it goes on to follow the round
that continued — no reload, and no button left over that the server would refuse.

★ **The card reaches the windows that are watching, not only the one that started the
round.** The approval is announced on the session's own channel, so every window looking
at that session gets the card — and what it is asking for — the moment it appears.
★ A window that opens afterwards finds the same card by reading the session's history:
the channel carries what happens next, not what already happened.

★ **The card does not need a reload.** If the connection drops while a round is running,
the client comes back to that round and reads the open approvals out of the transcript — so
an approval raised in that round still arrives on its own. ★ And if the server refuses that
return — the round is over, but its approval has not landed on disk yet — the client waits
for the round's ledger row to close and reads the transcript then.

★ **A message sent in that instant is refused, not swapped for the approval.** The session
stays busy until the card is on disk, so the server answers `409 session_busy` and the
message goes back to the input box — ★ the approval is never taken away by a message that
happened to arrive at the same moment.

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
- **The `api_key` line is retired** — a profile that still carries it is refused, and
  the message names the variable and the keyring entry that replace it (§4.2).
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

### The Secrets tab

The same dialog has **two tabs**: **Files** (the config editor above) and **Secrets**.
The Secrets tab lists the two namespaces the keys live in — **Providers** and **MCP
servers** — and the entities the configuration declares in them.

For the entity you pick, the panel shows three rows and no value:

| Row | What it means |
|---|---|
| Stored in | where the key is kept — `keyring:llm:deepseek`, or `—` |
| In effect | which key is actually used — the environment's, the keyring's, a file's, or `none` |
| Environment | the derived variable, and whether it is set |

★ **The value is write-only.** The panel never shows the key, not even its length: the
input is a password field, it is emptied after every write, and the value goes to the
keyring and nowhere else — not into the configuration tree, not into a log line, not
back to the browser.

★ **"Stored" and "in effect" disagree exactly when the environment overrides the
keyring** — and that is the trap of the whole design: the key was written, the write
said "stored", and the key that is used is a different one. The panel says so in a
warning, and so does `openheron secret set`.

★ **Removing a whole group asks first.** "Remove all providers" deletes the model keys
of the entities the configuration declares — and only those; the MCP servers' tokens are
in a different namespace and are not touched. The confirmation names the scope and the
count.

★ **The list is driven by the configuration.** An entry whose entity is gone — a provider
file you deleted — is invisible and cannot be removed from here: the keyring cannot be
enumerated, so there is no way to know it is there.

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

★ **The second window watches that turn.** It is not kept out of the conversation: it asks
the server which run owns the session and attaches to it, and the rest of the turn arrives
in that window too.

★ **An approval that appears reaches the second window too.** The session's own channel
carries the card — with the tool and its arguments — to every window watching that
session, so the window that did not start the round still shows the card and can answer
it.

```
POST /v2/run
{"threadId": "...", "runId": "..."}
```

★ **The attach is a read.** It is `POST /v2/run` with the run's `runId` and **no
question**: it starts no turn and claims no session, so the turn goes on whoever is
watching, and the server refuses an attach to a run that is over.

★ **The turn belongs to the server, not to the window that started it.** Close that window
and the attached one keeps receiving: the server archives the turn either way.

★ **The stop button is the way to take over.** It stops the session's turn — whoever owns
it — and then you can send. Every window that is watching sees it stop.

★ **A message that arrives while a turn is running is refused.** The window that sent it
says so:

```
This session is running in another window — stop it to take over
```

★ **Nothing is lost.** The refused message is not sent, so it does not appear in the
conversation. The turn that is running keeps going, untouched.

★ **This is a server-side rule, not a browser one.** Any client that talks to the API gets
the same answer, and the session's `state` reports `"running"` to every client looking at
it. `GET /v2/sessions/{id}/runs` says which run owns the session — that is how a second
window finds the turn to attach to — and the run's own history is there for the times when
it is not.

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

## 6.10 The sidebar is a file tree of projects

★ **Every conversation belongs to a project** (§3.1), and the sidebar shows that: one
folder per project, named after it, with the conversations in it. ★ The conversations that
belong to no project sit in a "Default Project" folder — that is the default project root.
★ **A project is a folder even when it
holds no conversations** — that folder is where the project's own actions live (§6.11),
so a project with nothing in it is still a folder you can rename, move or remove.

```bash
openheron              # every project: one folder per project
openheron .            # one project: one folder, and the "no project" conversations join it
```

★ **The folders open and close.** The arrow in front of a project's name folds it away, and
the number of conversations in it stays on the heading. ★ The folders you closed are
remembered on this machine, so the sidebar looks the same the next time you open it.
★ A project with no conversations has no arrow: there is nothing to open.

★ **A conversation keeps its project for its whole life** — there is no "move it to another
project"; a conversation that works in another directory is a new conversation.

★ **The `@` picker follows the project too**: it lists the files of the project the
conversation on screen belongs to.

## 6.11 Choosing a project, and managing the ones you have

★ **The entry is the button under the input box**, on the line that says which agent is
answering. ★ It **names the project the composer works in** — the same project the `@`
picker lists the files of — and clicking it opens the dialog of the table.

★ **The button has two forms, and the difference is the point.** On the **empty page** —
no conversation, or one that has not said anything yet — it is a button and it opens the
dialog. On a **conversation page** it is a **label**: it says where the work happens and
does nothing else. ★ A conversation's project is fixed, so the only thing a switch could do
there would be to leave the conversation — and a button that says one thing and does
another is worse than no button.

★ **The button is only there when there is a choice.** In the single-project
mode (`openheron .`) there is nothing to pick, so there is no button; and a
server that does not know the project table answers `503`, so the button is not
drawn there either.

★ **The empty page starts on "Default Project" — and that is the default project root.** A
conversation without a project works in `<openheron-root>/projects/default`, and that is the
fallback: nothing is picked until you pick it. ★ **New thread lets go of the project too** —
the project belonged to the conversation that was on screen, and a conversation's project is
fixed, so the composer comes back with no project. ★ The single-project mode is the
exception: the process serves one directory, so there is nothing to let go of.

The dialog holds two things:

- **Choose** — the first row is "Default Project": the conversations then work in the
  default project root. Then one row per project. Clicking a row moves the composer into it:
  the button under the input box and the `@` picker all name that project from then on, and
  the row that is the current one says so. ★ A conversation keeps its project for its whole
  life, so choosing another one **leaves** a conversation that belongs to a different
  project — it stays in the sidebar with its history, and the composer comes back empty.
  ★ The next question then opens a conversation in the project you picked.
- **Create** — a name (optional; the directory's own name is used when you
  leave it empty) and a root directory (required, and it must not be empty).
  The server turns the root into an absolute path and takes it as it is.
  ★ **Browse** — the button next to the root field opens **your system's own
  folder chooser**, the window you would open by hand, and puts the directory
  you pick into the field. ★ The window opens **on the machine the server
  runs on**, so a browser on another machine cannot use it — and closing it
  without choosing is not an error: what you typed stays where it is.

★ **The projects that already exist are managed in the sidebar**, on the project's own
row: the "⋯" next to the name opens its menu.

- **New conversation** — a new conversation in that project. The composer comes back empty
  and that project becomes the one it works in. ★ It never keeps the conversation that is
  already open — not even when that conversation belongs to that very project: a new
  conversation is a new one.
- **Rename project** — the name changes where it stands; the directory stays where it is.
  ★ The name is **required** here — the project already has one, and an empty name would
  take it away; the editor says so and keeps what you typed.
- **Change folder** — the directory the project points at. ★ That directory is where the
  work happens: a project *is* a directory. The **Browse** button opens your system's own
  folder chooser, the same one the create form uses.
- **Remove project** — the project leaves the sidebar. ★ **The conversations are kept**:
  they fall back to "no project" and keep their history. Removing a label must not remove
  the work.

★ **The project you just created is the one you work in right away** — the
composer switches into it. ★ The dialog stays open, with the new project in
the list and marked as the current one: it shows what the create did, and it
is where the next project would be created from.

★ **A refused create keeps the dialog open**, with what you typed still in it
and the server's reason under the form. The reason is the server's own
sentence: the server owns the rules, so the client keeps no second copy of
them.

## 6.12 The authorization mode

Under the input box, next to the project button, there is a **shield** that
says which approval level this conversation runs at:

| Level | What it says | What it means |
|---|---|---|
| `Default approval` | Tools ask before they run | The configuration decides (§4.3): every `ask`-tier tool stops and waits for you |
| `Trusted paths` | Writes inside the project, the session workspace and the configuration do not ask | A write that lands inside one of those three directories runs without stopping |
| `Full authorization` | Every tool runs without asking | Nothing asks any more — including the shell and configuration changes |

★ **The mode never gives the agent new tools.** It only answers "does this
call need a human decision?". Which tools an agent may use at all is decided
by the agent's own `tools:` list (§4.1) — a level above `Default approval`
cannot conjure a tool the agent was not given.

★ **The trusted paths are three directories, and they are yours:**

- the **project directory** the conversation works in (§3.1);
- the conversation's own **upload folder**, where the files you attached live;
- the **configuration directory** (§3).

★ **The shell still asks in the middle level.** A shell command can write
anywhere, so "inside a trusted path" is not a question a command line can
answer — only `Full authorization` stops asking about it.

★ **Configuration changes are still checked.** In the middle level the
configuration directory is a trusted path, so a write there does not stop for
your approval — but the configuration's own checks all still run: the file has
to parse, the tree has to keep loading, and a working agent may not vanish
because of the change (§4.9).

★ **Switching to `Full authorization` asks you once.** The interface says
plainly what that level means, and only then does the switch go through.
★ **Once per conversation**: switching away and back does not ask a second
time, but a **new** conversation asks again. The server keeps that fact, so a
second window on the same conversation does not ask either.

★ **A running turn keeps the level it started with.** You may change the
level while a turn is running — a change takes effect on the **next** turn,
and the mode dialog says so, so it cannot look as if it had already taken
effect.

★ **The level belongs to the conversation, not to you.** A new conversation
starts at `Default approval` unless you pick another level on the welcome
page; the configuration tree is unchanged by any of this, and the same
configuration gives two conversations two different behaviour.

★ **You can pick the level before the conversation starts.** The welcome page
has the shield too: the level you choose there is the level the conversation
is **born** in, and its first turn already runs under it. Choosing
`Full authorization` there asks you the same question an open conversation
asks — and the server still checks your answer when the conversation is
created.

★ **What the level was, stays in the record.** Each round's ledger row records
the level it ran under, so afterwards you can tell which rounds ran without
anyone watching.

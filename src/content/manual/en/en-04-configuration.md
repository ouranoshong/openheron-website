---
title: "Writing configuration"
chapter: "4"
order: 4
chapterSlug: "configuration"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

## 4.1 Agents (`agents/<name>.md`)

An agent is a markdown file: **frontmatter + body**. The body is the prompt the model
sees.

```markdown
---
description: "task: the concrete executor. Writes files per the task order."
model: deepseek/deepseek-flash
max_iterations: 50
reasoning: low
tools: [ls, read_file, write_file, edit_file, glob, grep, execute, write_todos]
mcps: []
summarize_at: 80%
---

You are the executing agent. Once you receive a task:
1. Read the relevant files first
2. Work through the task order item by item
3. Run the tests afterwards and paste the failures verbatim
```

Available frontmatter keys:

| Key | Meaning |
|---|---|
| `description` | What this agent is for (the parent agent uses it to decide whom to delegate to) |
| `model` | `<vendor>/<model>`, **required**, never inherited and never falls back |
| `max_iterations` | Cap on tool-loop iterations |
| `summarize_at` | When this agent's context is **compacted** into a summary: `80%` of the model's window (the default), an absolute token count (`104858`), or `0` for never |
| `subagents` | Whom it may delegate to (see §5) |
| `tools` | The tools **this agent may use** — every tool that is **not** an MCP one: the built-ins, the ones the files under `tools/` provide, and the `config_*` tools. ★ **Not declared means no tools at all**: the list is the whole answer. ★ MCP tools are **not** named here — the agent gets them by mounting the server (see §4.8) |
| `skills` | The skills this agent may load — an allow-list of the folders under `skills/`. **Not declared means no skill**, and so does an empty list |
| `mcps` | The MCP servers this agent **mounts** — **not declared means no server**, and so does an empty list. Mounting one starts a child process **and hands the agent all of that server's tools** (see §4.8) |
| `temperature` / `max_tokens` | Sampling parameters |
| `reasoning` | Reasoning tier: `off` / `low` / `high` / `max` (names defined by the vendor profile) |

★ **One wrong frontmatter key is a startup error** and is never ignored — on purpose: a
configuration that fails silently is far harder to debug than one that fails loudly.

★ **`model` is not inherited.** The model the parent agent uses does not carry over to
sub-agents — every agent has to name its own. That is exactly where "expert gets expert
model" lands.

★ **A model nobody declares leaves that agent out — it does not stop openheron.** The
agent is dropped from the tree and from every parent's `subagents:`, and the reason is
said in four places: the startup log, `/v2/health`, a grey notice on that agent's own
file in the config editor (§6.3), and the error a session gets if it asks for it.
★ The default agent is no exception: with no usable model, `main` is left out too, and
until you fix it **no session can start** — but openheron does start, which is what lets
you open the editor and fix the file. ★ The editor refuses the change that would cause
it: pointing a working agent at a model that does not exist is rejected at save time.

★ **A message that cannot start says why, not "timed out".** If the agent you are talking
to cannot be built, the chat shows the reason itself — `agent "main" is left out of the
tree: the model openai/gpt-4o-mini is not declared under llm/` — and the run ends with
the code `agent_unavailable`. ★ That code means "your configuration is broken", so the
answer is to open the editor and fix the file, not to send the message again.

★ **A `reasoning` tier only works if the model profile declares it.** An undeclared tier
is **silently ignored**: an agent says `reasoning: high`, the endpoint has no `high`, and
the effect is "no thinking at all" — with no error and no message. See §4.2.

★ **`summarize_at` is what keeps a long conversation alive.** Past that point the
conversation is replaced by a summary, and the summary is what the agent carries forward from
there on. It comes in three spellings:

| Spelling | Means |
|---|---|
| `summarize_at: 80%` | 80% of the `context_window` of the model this agent runs on |
| `summarize_at: 104858` | An absolute token count |
| `summarize_at: 0` | Never compact — the context grows until the endpoint refuses the request |

Leave the key out and the agent gets **80% of its window** — compaction is on by default.
80–90% is the usual range: a request that exactly fills the window is a request that gets
refused, and the room that is left is what the summary itself needs.

★ **A percentage needs a window.** If the model declares no `context_window`, there is
nothing to take 80% of: that agent never compacts, and openheron says so when it loads the
configuration. Declare `context_window` in `llm/<vendor>.yaml`, or set an absolute
`summarize_at` on the agent.

## 4.2 Model profiles (`llm/<vendor>.yaml`)

```yaml
type: openai_compat
base_url: https://api.deepseek.com
api_key: ${DEEPSEEK_API_KEY}
timeout: 5m

models:
  - id: deepseek-flash
    context_window: 131072
    reasoning:
      off:  { reasoning_effort: none, thinking: { type: disabled } }
      low:  { reasoning_effort: low,  thinking: { type: enabled } }
      high: { reasoning_effort: high, thinking: { type: enabled } }
      max:  { reasoning_effort: max,  thinking: { type: enabled } }
    reasoning_default: off
```

| Field | Meaning |
|---|---|
| `type` | Protocol type; currently `openai_compat` |
| `base_url` | The endpoint, **including the path**, copied from the vendor docs |
| `api_key` | An **environment variable name**, written as `${NAME}` — never a literal |
| `timeout` | Timeout, with a unit (`5m` / `30m`) |
| `models[].id` | Model name |
| `models[].context_window` | Context window — the size the compaction threshold is measured against |
| `models[].reasoning` | **Tier table**: tier name → what this endpoint actually sends |
| `models[].reasoning_default` | Which tier to use when the agent names no `reasoning` |
| `models[].timeout` | Overrides the vendor-level timeout (thinking models usually need more) |
| `hint_keys` | The endpoint's field names, used to give an accurate hint when a request is rejected |
| `extra` | Vendor-level dialect, passed through to every request |

★ **`api_key` may only be an environment variable name** (`${OPENAI_API_KEY}`) or a file
reference (`@file:/path`). Writing a literal secret into the configuration makes the
config editor refuse to save it — secrets do not belong in the repository.

★ **The compaction threshold belongs to the agent, not to the model.** `context_window` is the
model's; `summarize_at` is the agent's, because how much of that window this agent fills before
its history is summarized is this agent's own policy. One model can serve several agents with
different policies. A `summarize_at` left in a model profile is ignored, and openheron says so
when it loads the configuration.

Compaction shortens the **context**, not the **record**. The messages that were compacted away
stay in the transcript and stay readable; the summary is written next to them. Your own words
survive the cut: the summary keeps them.

★ **The `reasoning` tier table is not optional.** It is the translation layer between
"the agent writes `reasoning: high`" and "how this endpoint expresses high". A tier
missing from the table is silently ignored, so "I turned on high and it still does not
think" shows up in the most hidden way possible.

## 4.3 Which tools ask

**You do not have to decide.** A tool nobody names **asks** first: the run pauses and an
approval card appears (see §6.2). The default is the safe one — one extra click
against a destructive call nobody saw.

There are only two tiers:

| Tier | Meaning |
|---|---|
| `allow` | The tool runs without asking |
| `ask` | The tool waits for your nod |

**Two places name the exceptions**, and that is all of them:

| Where | What it decides |
|---|---|
| The `allows:` line of the file that provides the tool | Which of that file's tools run **without** asking; everything else the file provides asks |
| The `tools:` line of an agent | Which tools that agent **may use** — a tool that is not in it is not in its tool set, so the model does not even see it |

★ **There is no global list.** There is no file where you list the tools that ask, and
none where you list the tools nobody may use. A file names its own exceptions, an agent
names its own, and the two never merge — so the effective tool table of an agent is
always answerable from the configuration alone.

★ **The code carries a default list, and a file only adds to it.** The readers
(`ls` `read_file` `glob` `grep`) and the delegation tools (`task` `write_todos`
`skill`) run without a nod, always — no file can take that away. Everything else asks
until a file names it.

★ **The three tools that change the machine have a file too.** `write_file`,
`edit_file` and `execute` ask by default, and `tools/filesystem.yaml` is where you widen
them:

```yaml
# .openheron/tools/filesystem.yaml
allows: [write_file, edit_file, execute]
```

★ That file is a **tuner, not a switch**: the filesystem tools are always mounted, so the
file cannot add or remove one — it only moves their tier. **Widening is the file's job;
narrowing is the agent's** (`tools`), because narrowing is per agent and
widening is a decision about the tool.

The tools that come with a file of their own say so in that file:

```yaml
# .openheron/tools/http.yaml
methods: [get]
allows: [request_get]
```

`request_get` runs without asking; a `request_post` asks — and it is not even offered
unless `methods` names `post`. The knowledge base says the same thing: `kb.yaml` allows
`kb_search` — searching reads, while `kb_index` writes to the index on disk, so it
asks.

An MCP server says it in its own file and in **its own vocabulary** — the server's own
tool names, not the exposed ones (see §4.7):

```yaml
# .openheron/mcps/github.yaml
allows: [read_issue, list_issues]
```

★ **A tier is not a verdict about the tool.** A tool an agent may not use keeps its own
tier and says why: the effective tool table of an agent reports `blocked` with the
reason `tools` (§4.8). There is no third tier and no global
refusal — a tool is either available to that agent, or it is not in that agent's tool
set at all.

★ **The one exception cannot be widened.** `config_write` (§4.9) edits the
configuration itself, including the file whose `allows:` list would grant it — so a file
that could name it would be granting the tool that rewrites that file. It always asks,
whatever any file says.

## 4.4 External tools (`tools/`)

**No code change needed** — a provider whose configuration is absent mounts nothing, so
writing the file is what turns the tool on. Four file names are recognised today:

| File | Provides |
|---|---|
| `http.yaml` | A generic HTTP request tool |
| `web_search.yaml` | Web search |
| `wikipedia.yaml` | Encyclopedia lookup |
| `kb.yaml` | The knowledge base (see §7) |

★ The knowledge base is the one exception: its file only holds the settings — it is
switched on by a **non-empty `corpus_dir`**, not by the file's presence.

★ **Only these four file names are accepted** under `tools/`; any other name is a
**startup error** and is never silently ignored.

★ **`openheron init` writes the five files above** — the tool configurations are part
of the tree, because the factory agents name `request_get`, `duckduckgo_search` and
`wikipedia_search`, and a name no provider offers is reported as a typo. Pass
`--no-tools` and that directory stays empty. Not writing a file means not enabled: the
tool does not appear in the agent's tool table, and the model cannot see it.

★ **The file's `allows:` line decides what runs without asking** — `tools/http.yaml`
names `request_get`, `tools/kb.yaml` names `kb_search`. Everything else that file
provides asks (§4.3).

## 4.5 Process parameters (`server/config.yaml`)

| Field | Default | Meaning |
|---|---|---|
| `listen_addr` | `:8080` | Listen address |
| `data_dir` | `state` | Where sessions and checkpoints live |
| `static_dir` | `web/dist` | Frontend build output (used when `frontend_mode: dir`) |
| `frontend_mode` | `embed` | `embed` uses the interface baked into the binary; `dir` reads from disk |
| `start_timeout` | `60s` | Startup timeout |
| `lease_ttl` | `10m` | How long a run's lease survives without progress — **longer than the provider's own timeout** |
| `agent.max_depth` | `1` | Cap on delegation depth |
| `log_level` | `info` | `debug`, `info`, `warn` or `error` — decides which lines reach the output |
| `log_requests` | `false` | Whether to print the redacted model request body and the raw `tools` array at `debug` level; same effect as `OPENHERON_LOG_LLM_REQUESTS=1` |
| `log.file` | `""` | A file to write the log to, relative to the **config root** — empty means stderr only |

★ **`server/` is not hot-reloaded** — a change only takes effect after a restart. That is
why it is **read-only** in the config editor, and submitting it fails with
`section "server" is not editable`.

These environment variables override the file and take precedence:
`LISTEN_ADDR`, `DATA_DIR`, `PROJECT_ROOT`, `FRONTEND_MODE`, `STATIC_DIR`, `OPENHERON_LOG_LEVEL`,
`OPENHERON_LOG_FILE`, `OPENHERON_LOG_LLM_REQUESTS`.

★ `log_requests` and `OPENHERON_LOG_LLM_REQUESTS` are two spellings of the same switch: the
first sets the project default, the second decides one run (**the environment variable wins** —
the config is consulted only when it is unset). When on, every model request writes a redacted
body line and a raw `tools` line at `debug` level. With both off, a **rejected** request still
leaves its raw `tools` bytes, because that is the turn worth keeping. This is a content switch;
it has nothing to do with where `log.file` writes.

★ A `log_level` that is not one of the four falls back to `info`; the config's `deferred`
notices carry the reason.

★ The log goes to the standard error unless `log.file` names a path — relative to the
**config root**. The file is rotated by size, and a file that cannot be opened is a warning
rather than a failed start: the process stays on the standard error and says why.

## 4.6 Skills (`skills/`)

`skills/<name>/SKILL.md`, following eino's native skill convention.

★ Skills are looked up by **a different rule**: `$EINO_EXT_SKILLS_DIR` first, and only if
that is unset does it search **upwards** from the current directory for
`.openheron/skills`. That differs from the config root's "never search upwards" — skills
are a directory tree, and searching upwards lets you use skills from your home directory.

★ **Which skills an agent may use is declared by that agent.** The `skills` key in
`agents/<name>.md` is an allow-list, and the names are the folders under `skills/`:

```yaml
skills: [refactor, review]
```

Not declaring the key means **every** skill in the directory; declaring an empty list
means **none**. A skill outside the list is not advertised to the model, and asking for
it by name fails — a model cannot load what it cannot see. A name that is not in the
directory is reported in the log when the agent is built, rather than ignored.

★ **A skill is a folder, and that is what the editor asks for.** `/settings` lists each
partition as a folder in a file tree, so a skill appears as `skills/code-review/SKILL.md`:
type the skill's name, and the file inside it is always `SKILL.md`. The name is the same
one you write in an agent's `skills:` list, and it has to be readable back —
lowercase letters and digits, single `-` or `_` separators, so `code-review` and
`code_review` stay two different skills.

★ **When openheron reads skills from somewhere else, the section says so and refuses the
save.** The rule above means the directory in force can be a different one from
`<config root>/skills/`. Writing into the one nobody loads would change nothing, so the
editor shows what the process actually reads and keeps the section read-only. A process
that found no skills directory at all is not that case: `<config root>/skills/` is then
where the next start will look, and creating the first skill there works.

## 4.7 MCP servers (`mcps/`)

An MCP server is a program that offers tools to a model. openheron mounts **one server
per file**, and **the file's presence is the definition** — there is no `enabled` key.

`mcps/<server>.yaml` — the file's name is the server's name:

```yaml
# .openheron/mcps/github.yaml
transport: stdio
command: npx
args: ["-y", "@modelcontextprotocol/server-github"]
env:
  GITHUB_TOKEN: ${GITHUB_TOKEN}
timeout: 30s
call_timeout: 60s
tools: []
allows: [read_issue, list_issues]
```

The same server over HTTP:

```yaml
# .openheron/mcps/remote.yaml
transport: http
url: https://mcp.example.com/mcp
headers:
  Authorization: Bearer ${REMOTE_TOKEN}
timeout: 30s
call_timeout: 60s
```

| Field | Applies to | Meaning |
|---|---|---|
| `transport` | both | `stdio` (a child process) or `http` (**streamable HTTP** — there is no SSE transport). Defaults to `stdio` |
| `command` | stdio | The executable to run. **Required** |
| `args` | stdio | The command's arguments |
| `env` | stdio | The child's environment, layered over the inherited one |
| `url` | http | The server's address. **Required** |
| `headers` | http | Sent on every request |
| `timeout` | both | The ceiling for connect, initialize and list tools (default `30s`) |
| `call_timeout` | both | The ceiling for one tool call (default `60s`) |
| `tools` | both | A **filter** on the server's own tool names; absent or empty means all of them |
| `allows` | both | The server's own tool names that run **without** asking; everything else asks |

★ **The file's name must match `^[a-z0-9]+(_[a-z0-9]+)*$`.** A name with a run of
underscores is refused: the exposed name `mcp__a__b__x` could not be read back later —
is that the server `a` with the tool `b__x`, or the server `a__b` with the tool `x`?

★ **`openheron init` writes three servers** — `mcps/fetch.yaml`, `mcps/time.yaml` and
`mcps/deepwiki.yaml`. ★ Each of them **defines** a server, so a file that cannot be
parsed is not a server that is off, it is a configuration that does not load. ★ The two
stdio ones run `uvx`, and `uvx` is not installed by default — so the server does not
come up, **the log says so, and the agent carries on**. ★ **Writing a file of your own
under `mcps/` with your own command in it is the act of defining that server**; copy
one of the three and change the `command:`.

★ **The example that is not installed** — `mcps/_example.yaml` in the templates — is the
skeleton the settings editor starts a new server from. It is a scaffold, not a file to
install, so `openheron init` does not write it.

★ **The first start of a stdio server may be slow, and `timeout:` is the ceiling for
it.** The command is often a package runner (`npx`, `uvx`), and the first run installs
the server — that install is part of the start, so a server that needs a minute to
install does not come up within `timeout: 30s`. ★ It then does not come up at all, and
the turn carries on without its tools: run the command once by hand to warm the cache,
or give the file a longer `timeout:`.

★ **What fails at startup:** an unknown `transport`; a stdio server with no `command`; an
http server with no `url`; `env:` on an http server; an agent naming a server that does
not exist.

★ **What does not fail:** a bad `timeout` — it degrades to the default and is reported in
the notices; an unset `${ENV}` in `env:` — that entry is left out and reported. A wrong
timeout changes *how long we wait*, not *what happens*, so it must not keep a server from
starting.

**The names you will see.** A server's tool `create_issue` reaches the model as
`mcp__github__create_issue`. The server's own name and the exposed name are both shown
in the `/mcps` panel (see §6.8).

★ **The file does not have to name the credential.** In a sandbox the variable holds the
`credential@1` sentinel and the host's proxy swaps in the real value on the way out — so
the sentinel reaches the server through the inherited environment, and the same holds for
an http server's `headers:`.

★ **`mcps/` is hot.** A change takes effect on the next turn — no restart.

## 4.8 Which servers an agent gets

**The `mcps:` key in the agent's frontmatter** decides which servers the agent gets — and
mounting one **is** the grant:

```yaml
---
model: deepseek/deepseek-flash
mcps: [github]
---
```

| The `mcps:` key | Means |
|---|---|
| absent | **no** server |
| `[]` | **none** |
| `[github]` | exactly those servers — and all of their tools |

★ A sub-agent carries a list of its **own**, next to its own `skills` and `tools` — the
list is read from the agent that is running, not from the root's.

★ **Mounting is the grant.** `mcps:` says which servers are **started**, and the agent
**gets all of that server's tools** — there is no second list to write.

★ **`tools:` names the tools that are not MCP tools.** An `mcp__<server>__*` entry there
grants nothing: it is dropped, and the configuration reports a **notice** saying so. The
server belongs in `mcps:`.

★ **Approval is separate from mounting.** Mounting gives the agent the tools; whether a
tool runs without a nod comes from the server's own file (`mcps/<server>.yaml`), and the
default there is `ask` — **mounting is not approving**.

**`tools` takes a trailing `*` as a pattern.** An exact name, or a **trailing** `*`:

```yaml
tools: [ls, read_file, config_*]
```

- `config_*` — every tool whose name starts with `config_`.
- `ls` — exactly that one tool.

★ **`mcp*foo` and a lone `*` are refused at startup.** Only a *trailing* `*` is a pattern,
and a lone `*` would be a way of saying "everything" in a list whose whole point is to say
what is there: a rule whose reach differs from what it reads as is a silent mismatch.

## 4.9 The configuration tools

Six tools let an agent read and change the configuration it runs from. They are always
mounted and, like every other tool that is not an MCP one, only **visible** to the agents
whose `tools:` list names them:

| Tool | What it answers | Tier |
|---|---|---|
| `config_get` | One file (`{path}`: its text, revision, and whether it is hot), or `{}`: the partitions, the files that exist, and what the running process holds | allow |
| `config_validate` | `{path, content}`: would this file load, and where exactly is it wrong — the server reports the line. `{}`: check the tree on disk | allow |
| `config_template` | `{path}`: the skeleton that file starts from. `{section}`: that partition's templates. Neither: an index of what to ask for | allow |
| `config_notices` | What the loader noticed but did not refuse: renamed keys, retired directories, values that fell back to a default | allow |
| `config_tier` | `{tool}`: whether it asks. `{agent}`: that agent's tools and their tiers. Neither: the default tier and the whole exception list. Answers use this turn's configuration snapshot, so an agent written earlier in the same turn is not visible yet — the tool says so instead of claiming it does not exist | allow |
| `config_write` | Writes a file: checked against the tree, checked against the revision you read, and refused whole if the merge breaks. Takes effect on the next turn — `applied` means the watcher will pick it up, not that this turn can already see it | **ask** |

```markdown
---
# .openheron/agents/main.md
tools: [ls, read_file, glob, grep, task, write_todos, config_get, config_validate]
---
```

★ **Give `config_get` and `config_validate` before `config_write`.** The first two only
read; the third changes the configuration and always interrupts for approval. An agent
that can validate but not write is a useful reviewer; an agent that can only write is a
loader error waiting to happen.

★ **`config_write` cannot write `server/`, and `config_get` can still read it.** The
partition configures the process itself and is not hot-reloaded, so a change needs a
restart — the write path refuses it rather than saving something that silently does
nothing. Reading is a different question, and it is the one an agent asks when it wants
to know what the process is actually running with.

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
| `summarize_at` | When this agent's context is **compacted** into a summary: `80%` of the model's window (the default), an absolute token count (`104858`), or `off` / `0` for never |
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
is **refused while the configuration loads**: the tree does not come up at all, and the
message names the agent, the tier it asked for and the levels the model does declare.
See §4.2.

★ **`summarize_at` is what keeps a long conversation alive.** Past that point the
conversation is replaced by a summary, and the summary is what the agent carries forward from
there on. It comes in four spellings:

| Spelling | Means |
|---|---|
| `summarize_at: 80%` | 80% of the `context_window` of the model this agent runs on |
| `summarize_at: 104858` | An absolute token count |
| `summarize_at: off` | Never compact — the context grows until the endpoint refuses the request |
| `summarize_at: 0` | The same as `off` |

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
timeout: 5m

models:
  - id: deepseek-flash
    context_window: 1000000
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
| `api_key` | **Retired** — the key comes from the environment or the keyring, and the provider's own **file name** says which (§4.2) |
| `timeout` | Timeout, with a unit (`5m` / `30m`) |
| `models[].id` | Model name |
| `models[].context_window` | Context window — the size the compaction threshold is measured against |
| `models[].reasoning` | **Tier table**: tier name → what this endpoint actually sends |
| `models[].reasoning_default` | Which tier to use when the agent names no `reasoning` |
| `models[].timeout` | Overrides the vendor-level timeout (thinking models usually need more) |
| `hint_keys` | The endpoint's field names, used to give an accurate hint when a request is rejected |
| `extra` | Vendor-level dialect, passed through to every request |

★ **`api_key:` is retired.** A profile that still carries the line is **refused** —
both when it is loaded and when it is saved through the config editor — and the message
says where the key comes from now: the environment variable and the keyring entry that
the provider's own name derives. ★ Secrets do not belong in the repository: the key is
never written into the configuration tree.

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
missing from the table is **refused when the configuration loads** — the whole tree stays
down, and the message says which tier was asked for and which levels the model does
declare.

### The key: where it comes from

A model profile says nothing about the key any more. ★ **The provider's file name says
where the key comes from** — there is no `api_key:` line in `llm/<vendor>.yaml` any
more, and a file that still carries one is refused (the note above).

For the provider `deepseek` — the file `llm/deepseek.yaml` — the key has two possible
homes:

| | where it is |
|---|---|
| the environment (the override) | `LLM_DEEPSEEK_API_KEY` |
| the keyring (the store) | the entry `llm:deepseek` |

★ **The environment wins.** The chain is: the environment first, the keyring second. The
environment is asked first because it is what a container, a CI runner or an operator's
shell hands to this process for exactly this run; the keyring is what the machine keeps.
★ So a key stored in the keyring while a variable is set is **not in effect** — and both
the interface (§6.3) and `openheron secret list` say so out loud, because "stored" and
"in force" are two different questions.

★ **The name is derived, not chosen.** `llm/deepseek.yaml` can only ever be the provider
`deepseek`, so it can only ever be `LLM_DEEPSEEK_API_KEY` and `llm:deepseek`. One rule
instead of a table — and a profile cannot disagree with its own file name. ★ The MCP side
works the same way: `mcps/github.yaml` is `MCP_GITHUB_TOKEN` and the keyring entry
`mcp:github` (§4.7).

**In the environment.** macOS and Linux:

```sh
export LLM_DEEPSEEK_API_KEY=sk-...
```

To make it permanent, put the line in `~/.zshrc` (macOS), `~/.bashrc` (Linux with
bash) or `~/.profile` (any POSIX shell). ★ **On macOS and Linux the variable name is
case-sensitive.** `$env:llm_deepseek_api_key` is another variable there, and the provider
then reports that it has no key; on Windows it is the other way round (§2.2).

★ **The variable has to reach the process, not your login.** A `~/.bashrc` line is
read by **interactive bash only**: a systemd unit, a launchd job, a container and a CI
runner each get an environment of their own, and none of them reads your shell's rc
files. Give it to whatever starts openheron:

| openheron runs in | where the variable goes |
|---|---|
| a terminal | `export ...` (macOS and Linux) / `$env:... = ...` (Windows, see §2.2) |
| a systemd unit (Linux) | `Environment=LLM_DEEPSEEK_API_KEY=sk-...` in the unit file, then `systemctl daemon-reload` |
| a launchd job (macOS) | `EnvironmentVariables` in the job's plist |
| a container | `docker run -e LLM_DEEPSEEK_API_KEY=sk-...`, or `--env-file .env` |
| CI | the runner's secret store — the variable, not the key |

**In the keyring.** The Settings dialog's **Secrets** tab (§6.3) takes a value, or the
command line does:

```sh
openheron secret set llm deepseek
```

★ The value is read from the **standard input**, so it lands neither in the shell's
history nor in the process table. The keyring is the machine's own credential store —
the Windows Credential Manager, the macOS Keychain, the Linux Secret Service — so a key
in it is not a file in your project.

**The `@file:` form.** A variable may hold a **path** instead of the key:

```sh
export LLM_DEEPSEEK_API_KEY='@file:/etc/openheron/deepseek.key'
```

The file holds the same secret the variable would, and it is read at load time with its
content trimmed. Two things to know:

- ★ **A relative path is relative to the directory openheron was started from**, not
  to the configuration root — use an absolute path.
- ★ **A path that does not exist is a startup error**, not a reminder:
  `config: parse llm/deepseek.yaml: llm/deepseek.yaml: read secret file: open /etc/openheron/deepseek.key: no such file or directory`.
  The path is in the message twice — once as the file being parsed, once as the file the
  loader was reading — and that is the loader's own wording, not a typo.
  The difference is deliberate: an unset variable is a runtime state, a wrong path is
  a mistake in the configuration.

**How to tell that it worked.** A provider with no key is named in the startup log:

```
[main] config notice notice="llm/deepseek.yaml: no key for this provider: LLM_DEEPSEEK_API_KEY is not set and the keyring holds no llm:deepseek; calls to this endpoint will fail with 401 Unauthorized"
```

★ That reminder **does not stop the server**: openheron starts, the agent builds, and
the endpoint answers `401 Unauthorized` the first time it is called. The same notices
are under `deferred` in `GET /v2/config` and `GET /v2/health`.

★ **An empty variable is not an unset one.** `LLM_DEEPSEEK_API_KEY=` — set, but with
nothing in it — resolves to **no key at all**, and the reminder says so in as many words:
`LLM_DEEPSEEK_API_KEY is set but empty`. An unset variable produces the other sentence:
`LLM_DEEPSEEK_API_KEY is not set and the keyring holds no llm:deepseek`. The fields to
look at are `hasApiKey` and `keySource` in `GET /v2/config`; the provider entry reads

```json
{"id":"deepseek","baseUrl":"https://api.deepseek.com","hasApiKey":true,"keySource":"env:LLM_DEEPSEEK_API_KEY","models":[{"id":"deepseek-flash","contextWindow":1000000}]}
```

`hasApiKey` is `true` when a key was found and `false` when there is none — and the key
itself never leaves the process. `keySource` names the **place**:
`env:LLM_DEEPSEEK_API_KEY`, `keyring:llm:deepseek`, `file:/etc/openheron/deepseek.key`
or `none`. ★ **How the variable is emptied decides which of the two reminders you get**:
`$env:LLM_DEEPSEEK_API_KEY = ""` leaves an empty value behind ("set but empty"), while
`$env:LLM_DEEPSEEK_API_KEY = $null` removes the variable ("not set");
`export LLM_DEEPSEEK_API_KEY=` and `unset LLM_DEEPSEEK_API_KEY` are the same pair on a
Unix shell.

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

★ **No tool is exempt from its file.** `config_write` (§4.9) edits the configuration
itself, including the file whose `allows:` list grants it — so a file that names it is
granting the tool that rewrites that file. It asks like every other tool until
`tools/config.yaml` names it, and that file does not name it by default.

## 4.4 External tools (`tools/`)

**No code change needed** — a provider whose configuration is absent mounts nothing, so
writing the file is what turns the tool on. Six file names are recognised today:

| File | Provides |
|---|---|
| `http.yaml` | A generic HTTP request tool |
| `web_search.yaml` | Web search |
| `wikipedia.yaml` | Encyclopedia lookup |
| `kb.yaml` | The knowledge base (see §7) |
| `filesystem.yaml` | The filesystem tool set |
| `config.yaml` | The configuration tools themselves |

★ The knowledge base is not switched on by its file: it is switched on by a **non-empty
`corpus_dir`**, and its file only holds the settings. The filesystem and configuration
tools are the other way round — they are mounted whether their file is there or not.

★ **Only these six file names are accepted** under `tools/`; any other name is a
**startup error** and is never silently ignored.

★ **`openheron init` writes the six files above** — the tool configurations are part
of the tree, because the factory agents name `request_get`, `duckduckgo_search` and
`wikipedia_search`, and a name no provider offers is reported as a typo. Pass
`--no-tools` and that directory stays empty. ★ For a provider-driven tool, not writing
its file means not enabled: the tool does not appear in the agent's tool table, and the
model cannot see it. The filesystem and configuration tools are mounted either way —
for those two, a missing file takes away an exception, not the tool.

★ **The file's `allows:` line decides what runs without asking** — `tools/http.yaml`
names `request_get`, `tools/kb.yaml` names `kb_search`. Everything else that file
provides asks (§4.3).

★ **A proxy moves the boundary; it does not add to it.** `http.yaml` and `web_search.yaml`
carry an optional `proxy:` key. Empty is **no proxy**: the tool dials the target itself and
refuses a target that does not resolve to a public address, and that refusal is what keeps a
model from being used to reach the machine's own network. A proxy **replaces** that rule — a
proxy exists to reach what cannot be reached directly (an intranet host is not public, and
reaching it is what the proxy is for) — so with one configured the target may be any address
the proxy can reach, and the proxy is the boundary. The schemes are `http`, `https`, `socks5`
and `socks5h`; a wrong one is a **startup error**.

★ **The key has three settings**, and the third one is spelled out: `""` is no proxy, a URL
names the proxy — and the environment is ignored — and `env` hands the route to the
environment: `HTTP_PROXY`, `HTTPS_PROXY` and `NO_PROXY`. The default cannot mean "whatever
the environment happens to say": that would move the route of every tool on a machine that
exports a proxy, and the one who pays for that is the person whose machine it is. The
environment is read **once**, when the tool is built, so changing it later does not move a
running tool.

```yaml
# .openheron/tools/http.yaml
methods: [get]
proxy: http://127.0.0.1:7890
allows: [request_get]
```

```yaml
# .openheron/tools/http.yaml
methods: [get]
proxy: env
allows: [request_get]
```

★ The **model API calls** are a different client: they read `HTTP_PROXY` and `HTTPS_PROXY`
from the environment, and that is the path the sandbox Kit's credential substitution depends
on. The `proxy:` key is for the **tools**, and it looks at the environment only when it is
told to (`proxy: env`).

## 4.5 Process parameters (`server/config.yaml`)

| Field | Default | Meaning |
|---|---|---|
| `listen_addr` | `127.0.0.1:8080` | Listen address — the loopback by default; a bare `:8080` binds every interface (§9) |
| `data_dir` | `state` | Where sessions and checkpoints live |
| `static_dir` | `web/dist` | Frontend build output (used when `frontend_mode: dir`) |
| `frontend_mode` | `embed` | `embed` uses the interface baked into the binary; `dir` reads from disk |
| `start_timeout` | `60s` | Startup timeout |
| `lease_ttl` | `10m` | How long a run's lease survives without progress — **longer than the provider's own timeout** |
| `agent.max_depth` | `1` | Cap on delegation depth |
| `watch.enabled` | `true` | Whether the hot-reload watcher runs at all — with it off, **every** change needs a restart |
| `watch.debounce` | `200ms` | How long the watcher waits before it reads a changed file |
| `retry.max_retries` | `5` | How many times one turn may retry a model call |
| `log_level` | `info` | `debug`, `info`, `warn` or `error` — decides which lines reach the output |
| `log_requests` | `false` | Whether to print the redacted model request body and the raw `tools` array at `debug` level; same effect as `OPENHERON_LOG_LLM_REQUESTS=1` |
| `log.file` | `""` | A file to write the log to, relative to the **openheron root** — empty means stderr only. A new project's template names `logs/openheron.log` |
| `log.console` | `true` | Whether the standard error keeps a copy beside the file — a new project's template sets it to `false` |
| `log.max_size_mb` | `20` | Cap on one log file — `0` means no cap, and a negative value is normalised to `0` and reported |
| `log.max_age_days` | `14` | How many days a rotated file survives — `0` means no limit |
| `log.max_backups` | `5` | How many rotated files are kept — `0` means no limit |
| `log.compress` | `false` | Whether the rotated files are gzipped |

★ **`server/` is not hot-reloaded** — a change only takes effect after a restart. That is
why it is **read-only** in the config editor, and submitting it fails with
`section "server" is not editable: it is not hot-reloaded, so changes would need a restart`.

These environment variables override the file and take precedence:
`OPENHERON_LISTEN_ADDR`, `OPENHERON_DATA_DIR`, `OPENHERON_DEFAULT_PROJECT_ROOT`,
`OPENHERON_FRONTEND_MODE`, `OPENHERON_STATIC_DIR`,
`OPENHERON_LOG_LEVEL`, `OPENHERON_LOG_FILE`, `OPENHERON_LOG_LLM_REQUESTS`.

★ `data_dir` and `log.file` are measured from the **openheron root**; `static_dir` is measured
from the **project root** (§3).

★ `log_requests` and `OPENHERON_LOG_LLM_REQUESTS` are two spellings of the same switch: the
first sets the project default, the second decides one run (**the environment variable wins** —
the config is consulted only when it is unset). When on, every model request writes a redacted
body line and a raw `tools` line at `debug` level. With both off, a **rejected** request still
leaves its raw `tools` bytes, because that is the turn worth keeping. This is a content switch;
it has nothing to do with where `log.file` writes.

★ A `log_level` that is not one of the four falls back to `info`; the config's `deferred`
notices carry the reason.

★ Where the log goes is decided by two keys. `log.file` names the file — relative to the
**openheron root**, where the rest of the runtime state lives — and `log.console` says
whether the standard error keeps a copy beside it.
The **code's** defaults are an empty path and a stderr copy, so an untouched configuration
logs to the standard error only. A new project gets `logs/openheron.log` and a **false**
`log.console`: the log goes to the file, and the terminal goes quiet once the configuration
is read. The lines before that — and the reason a file could not be opened — still go to
the standard error.

★ **One line always reaches the terminal: the address the server serves on.** It is
printed once the listener is up, and neither `log.file` nor `log_level` can hide it —
the address is not a log record, it is what the process says about itself to the
terminal it was started on (`docs/runtime-design.md` §4.4).

★ **A second line appears when the listener is beyond the loopback**: `the server listens beyond the loopback; anyone who can reach this port can drive the agent`. It travels the same way, so a configuration that sends the log to a file cannot hide the fact that the agent is reachable from the network. On the loopback there is nothing to say, and nothing is said (`docs/runtime-design.md` §4.4).

★ The file is rotated by size, and a file that cannot be opened is a warning rather than a
failed start: the process stays on the standard error and says why.

## 4.6 Skills (`skills/`)

`skills/<name>/SKILL.md`, following eino's native skill convention.

★ Skills are looked up by **a different rule**: `$EINO_EXT_SKILLS_DIR` first, then the
**config root's** own `skills/`, and only if neither is there does it search **upwards**
from the current directory for `.openheron/skills`. The config root comes before the probe
because that is where the configuration editor writes — a skill saved where the
configuration is, and never loaded, is a skill nobody can use. The upward search is the
old layout, and it differs from the config root's "never search upwards" — skills are a
directory tree, and searching upwards lets you use skills from your home directory.

★ **Which skills an agent may use is declared by that agent.** The `skills` key in
`agents/<name>.md` is an allow-list, and the names are the folders under `skills/`:

```yaml
skills: [refactor, review]
```

Not declaring the key means **none** — an absent list and an empty list mean the same
thing, the same rule as `tools:`. A skill outside the list is not advertised to the model,
and asking for it by name fails — a model cannot load what it cannot see. A name that is
not in the directory is reported in the log when the agent is built, rather than ignored.

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

★ **`skills/` is hot.** Editing a `SKILL.md` under the config root takes effect on the
next turn — no restart. A skills directory that lives **elsewhere** is not watched: a
change there reaches the agents on the next start.

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
  GITHUB_TOKEN: ${MCP_GITHUB_TOKEN}
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
  Authorization: Bearer ${MCP_REMOTE_TOKEN}
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

★ **The credential's name is derived from the file's name.** `mcps/github.yaml` is the
server `github`, so its token is `MCP_GITHUB_TOKEN` and its keyring entry is
`mcp:github` — the same rule the model side uses (§4.2). ★ A `${MCP_GITHUB_TOKEN}` in
`env:` or in `headers:` is therefore not "a variable that happens to be spelled that
way": it is **that server's token**, resolved through the environment first and the
keyring second. ★ Every other `${NAME}` keeps its old meaning — a plain environment
lookup.

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

| Tool | What it answers | Which side it answers from | Tier |
|---|---|---|---|
| `config_get` | One file (`{path}`: its text, revision, and whether it is hot), or `{}`: the partitions, the files that exist, and what the running process holds. With `impact` it answers a different question instead: who depends on that file, and who the next turn rebuilds | the **disk** (`disk`) for a file's text; the overview carries both sides | allow — named by `tools/config.yaml`; ask without it |
| `config_validate` | `{path, content}`: would this file load, and where exactly is it wrong — the server reports the line. `{}`: check the tree on disk | the **disk** (`disk`) | allow — named by `tools/config.yaml`; ask without it |
| `config_template` | `{path}`: the skeleton that file starts from. `{section}`: that partition's templates. Neither: an index of what to ask for | neither — a skeleton is neither a file nor a tree | allow — named by `tools/config.yaml`; ask without it |
| `config_notices` | What the loader noticed but did not refuse: renamed keys, retired directories, values that fell back to a default | the **running** tree (`running`) | allow — named by `tools/config.yaml`; ask without it |
| `config_tier` | `{tool}`: whether it asks. `{agent}`: that agent's tools and their tiers. Neither: the default tier and the whole exception list. Answers use the tree this turn runs, so an agent written earlier in the same turn is not visible yet — the tool says so instead of claiming it does not exist | the **running** tree (`running`) | allow — named by `tools/config.yaml`; ask without it |
| `config_write` | Writes a file: checked against the tree, checked against the revision you read, and refused whole if the merge breaks. Takes effect on the next turn — `applied` means the watcher will pick it up, not that this turn can already see it. With `append` it adds the content to the end of the file instead of replacing it — the way to write a file whose whole text does not fit in one call | the write lands on the **disk**; the answer carries both sides | **ask** — the default file does not name it; `tools/config.yaml` can |

★ **Every answer says which side it came from.** The field is `source`, and it is `disk`
(the files on disk right now) or `running` (the tree this turn was built with). The two
do not contradict each other — they answer different questions: a change written earlier
in this turn is already in the disk's text and is not yet in the running tree's.

★ **The overview and the write answer carry the two versions instead**: `runningVersion`
and `diskVersion`. They differ for as long as a change has not been picked up, and that
difference is the answer to "has my change landed".

★ **A file longer than one call is written in pieces.** `config_write` replaces the whole
file, and one tool call is bounded by the model's own output limit — so a file whose text
does not fit in one call is written in pieces: the first piece replaces the file, and every
later piece goes with `append`, which adds to what is already on disk. Every piece goes
through the same gates, so the file on disk is loadable after **every** piece.

★ **A call the model could not finish is refused, not run.** When the output hits the
model's token limit, the arguments of the tool call are incomplete — and the server
refuses that call with a message that says so. Nothing is written and no approval card is
raised; the model is told to send less in one call.

★ **`config_get` has a second question: `impact`.** It does not read the file — it
answers "who depends on this file, and who does the next turn rebuild":

| Answer | What is in it |
|---|---|
| with a `path` | `dependents` (the agents this file says something about), `rebuilds` (the agents the next turn rebuilds), `changed` (did this file's contribution to some agent move), and `requiresRestart` when the change cannot be picked up without a restart |
| without one | `changedFiles` (the files whose contribution to some agent moved) and the same `rebuilds` |

★ **The impact answer comes from the running tree** (`running`), even though it compares
the disk with it: the dependency graph it walks is the running tree's, and the answer
says what the disk would change about it. So `config_get` with a `path` answers `disk`
and `config_get` with `impact` answers `running` — two questions, two sides.

★ **A change reaches only the agents that read the file.** The next turn rebuilds the
agents whose own dependencies moved — an agent that never reads the changed file keeps
the one it has. So editing one agent's file rebuilds that agent and its parents, and
leaves the rest of the tree alone.

★ **`dependents` is direct, `rebuilds` is transitive.** A parent carries its children's
identity, so a change to a sub-agent rebuilds the parent too: changing
`agents/skill-expert.md` lists `skill-expert` under `dependents`, and `skill-expert`
plus its parent under `rebuilds`.

★ **`requiresRestart` is the honest answer for a cold partition.** A file under `server/`
configures the process, not an agent: nothing reaches an agent, so the answer is
"nothing changes, and you have to restart" — not "nothing happens".

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

★ **The file tools go through the same checks.** `write_file` and `edit_file` on a path
inside the config root are handed to the configuration service, so the same gates run:
the tree must still load, a provider file may not carry an `api_key` line, and a
working agent must not disappear from the tree. ★ `edit_file` reads the file through the
service too, so it carries the revision and a change that raced it is refused;
`write_file` carries no revision, so a whole-file write is "the last writer wins" — the
gates still run.

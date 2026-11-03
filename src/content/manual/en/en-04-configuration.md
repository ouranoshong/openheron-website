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
disabled_tools: [kb_index]
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
| `disabled_tools` | Tool deny-list effective for **this agent** |
| `skills` | The skills this agent may use — an allow-list of the folders under `skills/` (**not declared means every skill**, an empty list means none) |
| `temperature` / `max_tokens` | Sampling parameters |
| `reasoning` | Reasoning tier: `off` / `low` / `high` / `max` (names defined by the vendor profile) |

★ **One wrong frontmatter key is a startup error** and is never ignored — on purpose: a
configuration that fails silently is far harder to debug than one that fails loudly.

★ **`model` is not inherited.** The model the parent agent uses does not carry over to
sub-agents — every agent has to name its own. That is exactly where "expert gets expert
model" lands.

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

## 4.3 The approval policy (`policy/permissions.yaml`)

```yaml
ask:
  - write_file
  - edit_file
  - execute
  - kb_index
deny: []
```

There are only two columns, and the semantics are plain:

- **Listed under `ask`**: every call needs **your nod**.
- **Listed under `deny`**: **nobody may use it**.
- **Listed in neither**: defaults to `allow` (straight through).

★ `deny` is **global**. The `disabled_tools` in `agents/*.md` only affects that one
agent and **cannot relax the outer `deny`**. It is the one guarantee a sub-agent cannot
loosen.

## 4.4 External tools (`tools/`)

**Enabled by the presence of the file** — no code change needed. Four file names are
recognised today:

| File | Provides |
|---|---|
| `http.yaml` | A generic HTTP request tool |
| `web_search.yaml` | Web search |
| `wikipedia.yaml` | Encyclopedia lookup |
| `kb.yaml` | The knowledge base (see §7) |

★ **Only these four file names are accepted** under `tools/`; any other name is a
**startup error** and is never silently ignored.

★ **`openheron init` writes nothing under `tools/` by default** — that whole directory is
yours to write. Pass `--tools` and it writes the four files above. Not writing a file
means not enabled: the tool does not appear in the agent's tool table, and the model
cannot see it.

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

★ **`server/` is not hot-reloaded** — a change only takes effect after a restart. That is
why it is **read-only** in the config editor, and submitting it fails with
`section "server" is not editable`.

These environment variables override the file and take precedence:
`LISTEN_ADDR`, `DATA_DIR`, `PROJECT_ROOT`, `FRONTEND_MODE`, `STATIC_DIR`.

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

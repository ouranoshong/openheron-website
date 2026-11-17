---
title: "First run"
chapter: "2"
order: 2
chapterSlug: "first-run"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

## 2.1 Getting it running

```bash
cd /your/project
export LLM_DEEPSEEK_API_KEY=sk-...   # or keep it in the keyring (§4.2)
openheron                             # the configuration is written on the first start
```

Open <http://localhost:8080>. ★ The terminal prints the address it serves on —
`the server serves on url=http://127.0.0.1:8080` — and that line shows up whatever
the log's destination is.

★ The key is read from the environment **or** from the keyring, and the environment
wins — §4.2 says how the two fit together and where each one lives; Windows sees §2.2.

★ **The server writes the configuration itself** the first time it starts in a
project that has none: the same tree `openheron init` writes (§2.3), with the
DeepSeek provider template. ★ **The key is not in that tree** — the provider's
name says where it comes from: `LLM_DEEPSEEK_API_KEY`, or the keyring entry
`llm:deepseek`. ★ Use `openheron init` when you want another model or provider,
or when you want the configuration written without starting the server.

## 2.2 Running it for the first time on Windows

In PowerShell, from nothing to running:

```powershell
cd C:\path\to\your-project
$env:LLM_DEEPSEEK_API_KEY = "sk-..."   # or keep it in the keyring (§4.2)
openheron
```

★ When `openheron` is not on the PATH, call it by its full path:
`%LOCALAPPDATA%\Programs\openheron\openheron.exe` (§1.3).

`init` prints one line when it is done:

```
the api key is read from LLM_DEEPSEEK_API_KEY when the configuration loads, or from the keyring entry llm:deepseek
store one with: openheron secret set llm <provider>
```

★ The server reports the same thing in its startup log when it writes the
configuration itself.

★ That line names **the Unix `export`**, which runs in neither PowerShell nor cmd.exe —
on Windows the same thing is `$env:LLM_DEEPSEEK_API_KEY = "sk-..."` (PowerShell) or
`set LLM_DEEPSEEK_API_KEY=sk-...` (cmd.exe).

### How to set the key

There are **two places** a key can live, and the provider's name decides what each
one is called: the environment variable `LLM_DEEPSEEK_API_KEY`, and the keyring
entry `llm:deepseek`. ★ **The environment wins** — §4.2 has the whole chain; this
is the Windows half of it.

**In the keyring — nothing lands on disk.** The Settings dialog's **Secrets** tab
(§6.3) takes a value, or the command line does:

```sh
openheron secret set llm deepseek
```

★ The value is read from the **standard input**, so it lands neither in the shell's
history nor in the process table. The command waits for you to paste the key and
press Enter.

**In the environment — four ways of writing it, and they do not reach the same far:**

- **The PowerShell window you are in** — `$env:LLM_DEEPSEEK_API_KEY = "sk-..."`: that window only.
- **Every terminal this user opens from now on** — `[Environment]::SetEnvironmentVariable('LLM_DEEPSEEK_API_KEY', 'sk-...', 'User')`: permanently; ★ **you have to open a new terminal**.
- **The cmd.exe window you are in** — `set LLM_DEEPSEEK_API_KEY=sk-...`: that window only.
- **The cmd.exe window, for this user** — `setx LLM_DEEPSEEK_API_KEY sk-...`: permanently; ★ **the value is truncated at 1024 characters**.

★ **A shell keeps the environment it started with** — the window that ran `setx` or
`[Environment]::SetEnvironmentVariable` does not see the variable; you have to **open
another terminal**.

★ **The key is read when the configuration is loaded** (§4.2), so the variable has to
reach **the process that starts openheron**: setting it in another terminal afterwards
does nothing for a server that is already running.

★ **On Windows the variable name is case-insensitive** — `$env:llm_deepseek_api_key` is the
`LLM_DEEPSEEK_API_KEY` variable; on macOS and Linux it is not (§4.2).

**Keeping the key out of the environment.** A variable may hold a **path** instead of
the key — the value starts with `@file:` and openheron reads the file:

```powershell
$env:LLM_DEEPSEEK_API_KEY = '@file:C:\Users\you\deepseek.key'
```

★ **The quotes are not optional**: without them the `@` starts a word. ★ **The path
has to be absolute** — a relative one is relative to **the directory openheron was
started from** (§4.2) — and ★ **a path that does not resolve is a startup error**,
not a reminder.

**How to tell that it worked.** Open `http://localhost:8080/v2/config` in a browser;
the provider entry reads `hasApiKey` and it should be `true`, and `keySource` names
the place the key came from; the startup log must not carry
`no key for this provider` (§4.2).

### Before it starts

★ **The place `init` writes to and the place the server reads from may not be the same.**
`init` writes the config root it is given — by default `<openheron-root>/configs` — and it
**does not read `$OPENHERON_CONFIG_ROOT`**; the server reads `--config-root` →
`$OPENHERON_CONFIG_ROOT` → `<openheron-root>/configs` (§3). With
`$OPENHERON_CONFIG_ROOT` set to somewhere else, the server comes up with "no configuration
at ...", because it is not reading the tree `init` wrote —
★ and it does not write one there either: a root you named is a root you own.
★ `init` does read `$OPENHERON_ROOT`, because that is where the default config root comes
from.

★ **When the child process cannot find the command on Windows**, change `command` to
`uvx.exe` in `mcps/fetch.yaml` and `mcps/time.yaml` — the two MCP servers need `uvx` on
the PATH (§2.3).

If the port is taken, change it **before** it starts: `$env:OPENHERON_LISTEN_ADDR = "127.0.0.1:9090"` (§10).
★ Keep the host in the address: `":9090"` alone binds **every** interface, and the agent's
tools run shell commands (§9).

## 2.3 What the configuration holds

The whole tree is written by `openheron init` — and by the server itself, the
first time it comes up with the **defaulted** config root and nothing in it:

```
~/.openheron/configs/           ← the config root
├── agents/
│   ├── main.md           # entry agent: understand the request, plan, dispatch
│   ├── task.md           # general execution expert: llm/ tools/ mcps/ server/
│   ├── agent-expert.md   # agent-domain expert: agents/*.md
│   └── skill-expert.md   # skill-domain expert: skills/<name>/SKILL.md
├── skills/
│   ├── openheron-config-map/SKILL.md        # the facts of the configuration system
│   ├── openheron-config-edit/SKILL.md       # the procedure for changing it
│   ├── openheron-config-templates/SKILL.md  # how to get a skeleton
│   ├── openheron-config-validate/SKILL.md   # the silent failures
│   └── openheron-agent-authoring/SKILL.md   # how to write an agent
├── llm/
│   └── deepseek.yaml    # model profile
├── mcps/
│   ├── fetch.yaml        # fetch a page and turn it into markdown
│   ├── time.yaml         # the current time and time-zone conversion
│   └── deepwiki.yaml     # public repository documentation and Q&A
├── tools/
│   ├── filesystem.yaml   # the tiers of the filesystem tools
│   ├── http.yaml         # request_get
│   ├── web_search.yaml   # duckduckgo_search
│   ├── wikipedia.yaml    # wikipedia_search
│   ├── kb.yaml           # the knowledge base (off: its corpus_dir is empty)
│   └── config.yaml       # the six configuration tools
└── server/
    └── config.yaml      # process parameters (not hot-reloaded)
```

★ **The tree lives in the config root, not in the project.** A project directory is a
project's business; the configuration is the user's, and it sits one level up, under the
openheron root (§3). ★ The one layout that puts the tree inside a project is the old one
— a run with **no** openheron root at all, where the config root falls back to
`<project>/.openheron`.

★ Two of the three MCP servers are stdio ones — `fetch` and `time` — and they need `uvx`
on the PATH and download their package on the first start; a server that cannot be
started costs that server's tools and nothing else (§4.7).

★ **There is no `policy/` file.** The tiers have a default and the exceptions are
named where the tool comes from (§4.3), so a file that says what the code already
does is noise — ★ noise in a configuration tree is read as meaning. Name your
exceptions in the tool's own file instead.

★ **Existing files are not overwritten** (unless you pass `--force`), so running it in
an already-configured project is safe.

Other `init` options:

| Option | Effect |
|---|---|
| `--config-root <path>` | Write into the given config root (default: `<openheron-root>/configs`) |
| `--provider <name>` | Choose the vendor, default `deepseek` |
| `--model <name>` | Choose the model, default `deepseek-flash` |
| `--base-url <url>` | The vendor endpoint (**with the path**, copy it from their docs) |
| `--no-tools` | Leave the tool configurations under `tools/` unwritten |
| `--force` | Overwrite existing files |
| `--dry-run` | Print what would be written, write nothing |
| `--json` | Machine-readable output |

★ `init` also creates the **default project root** (`<openheron-root>/projects/default`)
— the directory a conversation that belongs to no project works in. The command prints
the directory it created:

```
created /home/you/.openheron/projects/default (the default project root)
```

★ A **named** project root is not created for you: a typo must not grow an empty
directory. ★ A `--dry-run` writes nothing — a directory included.

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
openheron init                      # generate the configuration in the current directory
export DEEPSEEK_API_KEY=sk-...     # secrets are read from the environment only
openheron
```

Open <http://localhost:8080>.

★ The key is read from the environment, and **how** you set it depends on the system
you are on — macOS and Linux see §4.2, Windows see §2.2.

## 2.2 Running it for the first time on Windows

In PowerShell, from nothing to running:

```powershell
cd C:\path\to\your-project
openheron init                      # generate the configuration in the current directory
$env:DEEPSEEK_API_KEY = "sk-..."    # secrets are read from the environment only
openheron
```

★ When `openheron` is not on the PATH, call it by its full path:
`%LOCALAPPDATA%\Programs\openheron\openheron.exe` (§1.3).

`init` prints one line when it is done:

```
the api key is read from the environment at request time: export DEEPSEEK_API_KEY=...
```

★ That line uses **the Unix `export`**, which runs in neither PowerShell nor cmd.exe — on
Windows the same thing is `$env:DEEPSEEK_API_KEY = "sk-..."` (PowerShell) or
`set DEEPSEEK_API_KEY=sk-...` (cmd.exe).

### How to set the key

One command, four ways of writing it, and they do not reach the same far:

- **The PowerShell window you are in** — `$env:DEEPSEEK_API_KEY = "sk-..."`: that window only.
- **Every terminal this user opens from now on** — `[Environment]::SetEnvironmentVariable('DEEPSEEK_API_KEY', 'sk-...', 'User')`: permanently; ★ **you have to open a new terminal**.
- **The cmd.exe window you are in** — `set DEEPSEEK_API_KEY=sk-...`: that window only.
- **The cmd.exe window, for this user** — `setx DEEPSEEK_API_KEY sk-...`: permanently; ★ **the value is truncated at 1024 characters**.

★ **A shell keeps the environment it started with** — the window that ran `setx` or
`[Environment]::SetEnvironmentVariable` does not see the variable; you have to **open
another terminal**.

★ **The key is read when the configuration is loaded** (§4.2), so the variable has to
reach **the process that starts openheron**: setting it in another terminal afterwards
does nothing for a server that is already running.

★ **On Windows the variable name is case-insensitive** — `$env:deepseek_api_key` is the
`DEEPSEEK_API_KEY` variable; on macOS and Linux it is not (§4.2).

**Putting the key in a file.** To keep the secret out of the environment, point
`@file:` at a file:

```yaml
api_key: '@file:C:\Users\you\deepseek.key'   # single quotes
api_key: "@file:C:/Users/you/deepseek.key"    # or forward slashes
```

★ **Double quotes with backslashes do not work on Windows**: `\` is an escape character
inside a YAML double-quoted scalar and `\U` is not a legal escape, so the whole profile
fails to parse (`yaml: did not find expected hexdecimal number`). Use single quotes, or
write the path with forward slashes. ★ The path has to be **absolute**: a relative one is
relative to **the directory openheron was started from** (§4.2).

**How to tell that it worked.** Open `http://localhost:8080/v2/config` in a browser; the
provider entry reads `hasApiKey` and it should be `true`; and the startup log must not
carry `api_key env DEEPSEEK_API_KEY is not set` (§4.2).

### Before it starts

★ **The place `init` writes to and the place the server reads from may not be the same.**
`init` always writes `.openheron` under the current directory and it **does not look at**
`$OPENHERON_CONFIG_DIR`; the server reads `--config-dir` → `$OPENHERON_CONFIG_DIR` →
`.openheron` under the project root (§3). With that environment variable set, the server
comes up with "no configuration at ...", because it is not reading the tree `init` wrote.

★ **When the child process cannot find the command on Windows**, change `command` to
`uvx.exe` in `mcps/fetch.yaml` and `mcps/time.yaml` — the two MCP servers need `uvx` on
the PATH (§2.3).

If the port is taken, change it **before** it starts: `$env:LISTEN_ADDR = ":9090"` (§10).

## 2.3 What init writes

`openheron init` writes the whole tree:

```
your/project/
└── .openheron/
    ├── agents/
    │   ├── main.md           # entry agent: understand the request, plan, dispatch
    │   ├── task.md           # general execution expert: llm/ tools/ mcps/ server/
    │   ├── agent-expert.md   # agent-domain expert: agents/*.md
    │   └── skill-expert.md   # skill-domain expert: skills/<name>/SKILL.md
    ├── skills/
    │   ├── openheron-config-map/SKILL.md        # the facts of the configuration system
    │   ├── openheron-config-edit/SKILL.md       # the procedure for changing it
    │   ├── openheron-config-templates/SKILL.md  # how to get a skeleton
    │   └── openheron-config-validate/SKILL.md   # the silent failures
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
    │   └── kb.yaml           # the knowledge base (off: its corpus_dir is empty)
    └── server/
        └── config.yaml      # process parameters (not hot-reloaded)
```

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
| `--dir <path>` | Write into the given directory (default: current directory) |
| `--provider <name>` | Choose the vendor, default `deepseek` |
| `--model <name>` | Choose the model, default `deepseek-flash` |
| `--base-url <url>` | The vendor endpoint (**with the path**, copy it from their docs) |
| `--env <NAME>` | The environment variable holding the secret, default `<PROVIDER>_API_KEY` |
| `--no-tools` | Leave the tool configurations under `tools/` unwritten |
| `--force` | Overwrite existing files |
| `--dry-run` | Print what would be written, write nothing |
| `--json` | Machine-readable output |

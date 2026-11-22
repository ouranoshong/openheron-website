---
title: "FAQ"
chapter: "10"
order: 10
chapterSlug: "faq"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

**Q: Startup says ``no configuration at ...: run `openheron init` to create one``**
The config root is empty and the server could not write one itself — it does
that on the first start in a project that has none. The startup log says why
the automatic initialization failed; `openheron init` does the same thing with a
model and a provider of your choice.

**Q: `config: load <path>: agents/main.md does not exist or could not be parsed`**
One of two things: the config root points at the wrong place (fix it with
`--config-root` or `$OPENHERON_CONFIG_ROOT`), or the frontmatter of `agents/main.md` has
a wrong key.

**Q: I changed `agents/main.md` and nothing happened?**
`agents/` is hot-reloaded, so it should have taken effect. If it did not, look for the
reload error in the startup log. `server/` is **not** hot-reloaded and needs a restart.
`skills/` is hot too — a `SKILL.md` under the config root takes effect on the next turn
(§4.6) — but a skills directory that lives elsewhere is not watched.

**Q: I changed one agent's file — do the other agents change too?**
No, and that is the point. A change reaches only the agents that read the file: the next
turn rebuilds the agent you edited and its parents, and the others keep what they had.
`config_get` with `impact` tells you who is in that set before you change anything
(§4.9).

**Q: The model does not think — `reasoning: high` seems to do nothing?**
Most likely the model profile **does not declare the `high` tier**. That is not a silent
no-op: the configuration does not load, and the message names the agent, the tier and the
levels the model does declare. Add it under `models[].reasoning` in `llm/<vendor>.yaml`.

**Q: `kb_search` finds nothing, or finds the wrong things?**
Run `openheron kb status` first: `lexical-only retrieval` means there are no vectors
and the hybrid score is not in effect. Configure an embedding model and re-index.

**Q: An agent cannot call `write_file`?**
Two possibilities: it is not in that agent's `tools:` list — then the model does not even
see it — or it is an `ask` tool and nobody answered the approval card. Check
`GET /v2/agents/:agentId` for the effective tool table. In the factory configuration
`main` keeps only the readers and the delegation tool, because it orchestrates and hands
the writing to `task`.

**Q: `/v2/run` says `threadId is required`**
Create the session with `POST /v2/sessions` first.

**Q: The model does not see the MCP server's tools?**
Open `/mcps` (see §6.8). A server the agent does not mount reads `unused`; a tool the agent
cannot reach reads `blocked`, and the reason names `mcps` — the agent does not mount that
server. A server that reads `unreachable` carries the error that says why it could not be
started.

**Q: An MCP server does not start?**
The startup error names the file and the field. `mcps/` is hot, so a fix takes effect on
the next turn — no restart.

**Q: The panel says a server is `starting`?**
It is on its way: the servers are started in the background when the configuration is
known. The tools it brings join the **next** turn — press **Refresh** to see them.

**Q: The port is taken / the interface will not open?**
Change the port in `listen_addr`, or override it with the `OPENHERON_LISTEN_ADDR`
environment variable. ★ Keep the host in it: `127.0.0.1:9090` is the safe form, and a bare `:9090`
binds every interface.

**Q: How do I see what the server actually loaded?**
`GET /v2/config` returns the effective configuration; `GET /v2/health` returns the
health status and any `deferred` notices; `GET /v2/runtime` returns the runtime status.
The startup log also prints the config root path.

**Q: On Windows the agent's shell tool fails, or runs commands the model wrote
for another system?**
The `execute` tool picks its shell when the server starts — see §1.3 ("On
Windows"). It prefers a POSIX shell and falls back to `cmd.exe` when the
machine has none; either way the tool's description tells the model which
dialect to write, so the command is written for the shell that runs it.
★ The startup log names the shell it picked.

**Q: Is the `grep` tool weaker without ripgrep?**
It searches with its own engine: the same regular expressions, the same caps, the same
budget, and the same answer to "is this file there". What it does not do is read
`.gitignore`, and it knows fewer file types — a type it does not know is refused
rather than guessed at. ★ The startup log names the engine that was picked; install
ripgrep to get the other one.

**Q: Where does my API key go?**
Nowhere in the configuration. The provider's **file name** says where the key comes
from: `llm/deepseek.yaml` is the environment variable `LLM_DEEPSEEK_API_KEY` or the
keyring entry `llm:deepseek` — and the environment wins. Store one with
`openheron secret set llm deepseek` or in the Settings dialog's **Secrets** tab
(§6.3); export the variable instead when a container or a CI runner has to see it
(§4.2).

**Q: The startup says the `api_key` line is no longer read?**
The profile still carries the old line. ★ Delete it: the key is not in the configuration
any more, and the message names the variable and the keyring entry that replace it
(§4.2).

**Q: With the desktop app, no interface appears but a browser opened?**
The embedded window could not start (usually a missing WebView2 Runtime or
`WebKitGTK`). This is the **fallback path, not a fault** — the browser does
exactly the same; install that runtime if you want the embedded window.

**Q: The desktop app's tray icon never appears (Linux)?**
Your desktop environment **has no tray host**: the tray speaks the StatusNotifier
protocol, so an SNI host has to display it. KDE Plasma has one built in; ★
**GNOME does not by default** ⇒ install an AppIndicator extension
(Debian/Ubuntu: `gnome-shell-extension-appindicator`) and enable it. Searching
the log for `systray error` shows whether that is the problem.

**Q: Can the tray menu be switched to English?**
Yes: click **"language ▸"** in the tray and pick `English` — ★ the menu
**redraws at once**, no restart, and the choice is **remembered** (it is written
into `desktop.yaml` as `lang:`). ★ By default it **follows your system
language**. ★ But the **web interface in the embedded window** is not affected
— that is openheron's own interface.

**Q: The desktop app does not start and says openheron is too old?**
★ The desktop app **does not read version numbers, it reads capabilities** — it
runs `openheron --help` before starting and looks for `--config-root` /
`--openheron-root`. Without them it refuses to start: update openheron by hand
(§1.1), then start the desktop app again.

**Q: Where do I look when the desktop app misbehaves?**
Its own log: `%LOCALAPPDATA%\openheron-desktop\logs\desktop.log` (on Linux,
`~/.config/openheron-desktop/logs/desktop.log`). It holds the port, the
arguments and the raw output of the child processes, and **no key values**.
★ Almost every broken state is fixed by clicking **"restart the service"** once
(§2.4).

**Q: Can the desktop app hold a fixed port?**
★ **No** — the forced loopback and the port picked on every start are hard
constraints, and there is no switch for them (§2.4).

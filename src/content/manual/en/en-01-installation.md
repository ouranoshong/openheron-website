---
title: "Installation"
chapter: "1"
order: 1
chapterSlug: "installation"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

You need **Go 1.27.1+** (to build).

```bash
git clone https://github.com/ouranoshong/openheron
cd openheron
task build
```

`task build` builds the frontend and **embeds the interface into the binary**, producing
`bin/openheron` — a self-contained executable that runs on any machine (cross-compile
for platforms other than your build host).

If you just want to try it quickly:

```bash
task build-go     # backend only (no UI) — faster while iterating on Go code
```

★ **Or install a released binary.** Every `v*` tag publishes the same self-contained
executable for six platforms — the interface is embedded, so nothing has to be installed
next to it. One command does the whole thing:

```bash
# Linux / macOS
curl -fsSL https://github.com/ouranoshong/openheron/releases/latest/download/install.sh | sh
```

```powershell
# Windows
irm https://github.com/ouranoshong/openheron/releases/latest/download/install.ps1 | iex
```

The installer picks the asset for your platform, **verifies its sha256 against the
release's `checksums.txt`**, and installs it into `~/.local/bin`. A download that does
not match the checksum is not installed.

| Variable | Effect |
|---|---|
| `OPENHERON_VERSION` | Install a specific tag instead of the latest release |
| `INSTALL_DIR` | Where to install (default `~/.local/bin`) |
| `OPENHERON_REPO` | Install from another `owner/repo` |
| `OPENHERON_TOKEN` | A token, for a private repository |
| `OPENHERON_API_URL` | The API host (default `https://api.github.com`; a GitHub Enterprise one is `https://<host>/api/v3`) |

Prefer to look before you run? Download `install.sh` from the
[releases page](https://github.com/ouranoshong/openheron/releases/latest) and read it —
the script is part of the release, next to the binaries it installs.

Without the script, take the archive from the
[releases page](https://github.com/ouranoshong/openheron/releases/latest) and check it
against the `checksums.txt` next to it:

| Platform | Asset |
|---|---|
| Linux x64 | `openheron_<version>_linux_amd64.tar.gz` |
| Linux arm64 | `openheron_<version>_linux_arm64.tar.gz` |
| macOS x64 | `openheron_<version>_darwin_amd64.tar.gz` |
| macOS arm64 | `openheron_<version>_darwin_arm64.tar.gz` |
| Windows x64 | `openheron_<version>_windows_amd64.zip` |
| Windows arm64 | `openheron_<version>_windows_arm64.zip` |

## Running it in a sandbox

★ **The binary is not the only way to run openheron.** If you would rather the
agent's file and shell tools could not reach your machine at all, openheron
ships as a Docker Sandbox Kit: the whole process — the HTTP/SSE server, the
file tools and the shell tool — runs inside a microVM, and the workspace you
name is the only thing that crosses the boundary.

**What it takes.** A Docker account (`sbx login`), a hypervisor (KVM on
Linux), and the model key bound on the host the way openheron reads it:

```sh
printf '%s' "$DEEPSEEK_API_KEY" | sbx secret set-custom \
    --host api.deepseek.com --env DEEPSEEK_API_KEY \
    --placeholder proxy-managed --value-stdin
```

★ `proxy-managed` is a sentinel: the container sees that string, and the
host's proxy swaps in the real value on the way out. The key itself never
enters the sandbox.

**Starting it.** Two Kits, and the runtime resolves them separately — the
**workload** (the server) and a **mixin** (the credential and the network
rule that goes with it). The published set:

```sh
sbx run docker.io/ouranoshong/openheron-kit:latest \
    --kit docker.io/ouranoshong/openheron-kit-deepseek:latest \
    --name openheron ~/my-project
```

★ A mixin is a declaration, so it can also be a **directory holding one YAML
file**: no image, no build, and editing one line points it at your own
endpoint. The workload has a root filesystem, so it stays an image.

**Opening it.** The runtime publishes the port the workload declares, on an
ephemeral loopback port:

```sh
sbx ports openheron
```

```
HOST IP     HOST PORT   SANDBOX PORT   PROTOCOL
127.0.0.1   32772       8080           tcp
::1         32772       8080           tcp
```

★ Open **http://127.0.0.1:32772** — the same interface, the same API, the
same agent.

**What is different.** Not much, and all of it in your favour:

- The **workspace** is a directory on your host, mounted into the sandbox at
  the same path. The agent's edits land there, and you can watch them arrive.
- The **configuration** lands in that workspace too: `.openheron/` is written
  on the first start, and it is yours to edit from then on.
- The **key** stays on the host; the sandbox holds a sentinel.
- **Approvals** still apply, and the default is the safe one: every tool asks
  first, and the files under `.openheron/tools/` and `.openheron/mcps/` name the
  exceptions (see §4.3).

★ The step-by-step guide is
`sandbox-kit/TUTORIAL.md` (Chinese:
`sandbox-kit/TUTORIAL_zh.md`), and the design
behind it is in `docs/sandbox-kit-design.md` — that document is
Chinese only, like every design document in this repository.

```bash
sha256sum -c checksums.txt --ignore-missing
```

★ The binary is static (`CGO_ENABLED=0`), so it runs on any machine of that platform —
no Go, no Node, no runtime to install.

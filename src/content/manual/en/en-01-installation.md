---
title: "Installation"
chapter: "1"
order: 1
chapterSlug: "installation"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

openheron is a self-contained executable — the interface is embedded in the binary, so
nothing has to be installed next to it. How you install it depends on where you are:

| Where you are | Read |
|---|---|
| You just want to use it | §1.1 Install a release |
| You are going to change the code | §1.2 Build it from source |
| You are on Windows | §1.3 On Windows |
| You want the agent's tools to have no way to reach your machine | §1.4 Running it in a sandbox |

## 1.1 Install a release

Every `v*` tag publishes the same self-contained executable for six platforms. One
command does the whole thing:

```bash
# Linux / macOS
curl -fsSL https://github.com/ouranoshong/openheron/releases/latest/download/install.sh | sh
```

```powershell
# Windows
irm https://github.com/ouranoshong/openheron/releases/latest/download/install.ps1 | iex
```

The installer picks the asset for your platform, **verifies its sha256 against the
release's `checksums.txt`**, and installs it into `~/.local/bin`
(`%LOCALAPPDATA%\Programs\openheron` on Windows). A download that does not
match the checksum is not installed.

| Variable | Effect |
|---|---|
| `OPENHERON_VERSION` | Install a specific tag instead of the latest release |
| `INSTALL_DIR` | Where to install (default `~/.local/bin`, or `%LOCALAPPDATA%\Programs\openheron` on Windows) |
| `OPENHERON_REPO` | Install from another `owner/repo` |
| `OPENHERON_TOKEN` | A token, for a private repository |
| `OPENHERON_API_URL` | The API host (default `https://api.github.com`; a GitHub Enterprise one is `https://<host>/api/v3`) |

★ Prefer to look before you run? Download `install.sh` from the
[releases page](https://github.com/ouranoshong/openheron/releases/latest) and read it —
the script is part of the release, next to the binaries it installs.

**Without the script**, take the archive from the
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

```bash
sha256sum -c checksums.txt --ignore-missing
```

★ The binary is static (`CGO_ENABLED=0`), so it runs on any machine of that platform —
no Go, no Node, no runtime to install.

★ Once it is installed: running it is §2, and where the key comes from is §4.2.

## 1.2 Build it from source

You only need this one if you are going to change the code. You need **Go 1.27.1+**
(to build), plus [go-task](https://taskfile.dev) and [Bun](https://bun.sh): the
interface is built with Bun and embedded into the binary, so the two build tools are
not optional.

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

★ On Windows the product is `bin\openheron.exe` — the executable keeps the `.exe` suffix
there. And `python3` on Windows is the Microsoft Store alias — it exists and runs
nothing — so the repository's own scripts call `python` there. It only matters for the
document checks (`task lint-docs`).

## 1.3 On Windows

★ **Two things differ from the Unix installer.** The location is
`%LOCALAPPDATA%\Programs\openheron` — not `~/.local/bin` — and it **does not touch
your PATH**: the script only prints a hint when that directory is not on it. Add it
yourself, or call the binary by its full path:

```powershell
# put the install directory on the user PATH
$dir = "$env:LOCALAPPDATA\Programs\openheron"
[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + $dir, 'User')
```

★ Open a **new** terminal afterwards: a shell keeps the PATH it started with.

From `cmd.exe` there is no `irm`, so hand the line to PowerShell:

```cmd
powershell -c "irm https://github.com/ouranoshong/openheron/releases/latest/download/install.ps1 | iex"
```

**Where the tools differ.** The file tools (`read_file`, `write_file`, `edit_file`,
`ls` and `glob`) are the runtime's own code, and they work on Windows as they are;
only `grep` needs [ripgrep](https://github.com/BurntSushi/ripgrep) (`rg`) on top —
Windows does not ship it, and without it you get
`ripgrep (rg) is not installed or not in PATH` (§10).

**The shell tool finds a shell by itself.** `execute` needs a program to run the
command in, and openheron looks for one when the process starts, in this order: `sh`
or `bash` on PATH → Git for Windows (`C:\Program Files\Git\usr\bin\bash.exe`) and
MSYS2 (`C:\msys64\usr\bin\sh.exe`) → the WSL launcher
(`C:\Windows\System32\bash.exe`, **last**, because it runs the command in a Linux
filesystem, where `C:\Users` is `/mnt/c/Users`).

★ Each candidate is checked by running one trivial command, so the `bash.exe`
that ships with Windows — it is on every machine and does nothing without a
WSL distribution — is not mistaken for a shell. The first candidate that runs
wins, and a shell found outside PATH gets its own directory put first in the
child's PATH, so `ls` and its neighbours are found.

★ **With no POSIX shell at all the tool falls back to `cmd.exe`**, and its
description tells the model to write Windows commands (`dir`, `type`, `copy`)
rather than POSIX ones (`ls`, `cat`, `cp`). ★ The dialect is never a guess:
the description the model reads and the program that runs the command are the
same answer, decided once at startup. The other way out is to leave `execute`
out of that agent's `tools:` list — the factory configuration already does
that.

## 1.4 Running it in a sandbox

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

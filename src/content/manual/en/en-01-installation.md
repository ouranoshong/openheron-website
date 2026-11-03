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
make build
```

`make build` builds the frontend and **embeds the interface into the binary**, producing
`bin/openheron` — a self-contained executable that runs on any machine (cross-compile
for platforms other than your build host).

If you just want to try it quickly:

```bash
make build-go     # backend only (no UI) — faster while iterating on Go code
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

```bash
sha256sum -c checksums.txt --ignore-missing
```

★ The binary is static (`CGO_ENABLED=0`), so it runs on any machine of that platform —
no Go, no Node, no runtime to install.

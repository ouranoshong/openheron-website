---
title: "The roots: where your configuration, your state and your project live"
chapter: "3"
order: 3
chapterSlug: "config-root"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

**Exactly three levels, no upward search**:

```
--config-root  →  $OPENHERON_CONFIG_ROOT  →  <openheron-root>/configs
```

★ The **openheron root** is the user-level base directory, and it is the one thing that
does not move when the configuration moves:

```
--openheron-root  →  $OPENHERON_ROOT  →  ~/.openheron
```

```
~/.openheron/                  ← the openheron root
  configs/                     ← the config root: agents/ llm/ mcps/ tools/ skills/ server/
  state/                       ← the data dir: sessions, checkpoints, the knowledge-base index
    projects.json              ← the project table: which session belongs to which project
  logs/openheron.log           ← the log file
  projects/default/            ← the default project root
```

- **The default level is created for you** when it does not exist — and the tree in it
  is written for you too, on the first start (§2.1).
- The first two levels are **not** created when they point nowhere — a typo must not
  silently grow an empty configuration tree. Startup then reports
  `config: load <path>: ...`, which tells you where it went wrong.
- The config root **does not depend on "where the process was started from"**: running
  `openheron` in a subdirectory still reads the same configuration.
- ★ **A root you named is never written into**: `--config-root` and `$OPENHERON_CONFIG_ROOT`
  point at a directory you chose, and an empty one is your decision, not a gap.
- ★ **The state and the log file live in the openheron root**, not in the config root: moving
  the configuration does not move your history with it.
- ★ **The old names still work** — `$OPENHERON_CONFIG_DIR`, `$PROJECT_ROOT`, `$DATA_DIR`,
  `$LISTEN_ADDR`, `$STATIC_DIR`, `$FRONTEND_MODE`, `--project-root` — and the
  old one is reported when it is used, so a setting that silently stopped working never does.
- ★ **`--config-dir` is not one of the server's flags.** `openheron --config-dir x` is a
  hard error (`flag provided but not defined: -config-dir`). The previous name lives on
  the two subcommands that have their own flag set — `openheron secret` and `openheron kb`
  (§8) — and those take it quietly, without the report.

If the default root has no `agents/main.md` **and the server could not write one**,
startup says so directly:

```
no configuration at /home/you/.openheron/configs: run `openheron init` to create one
```

## 3.1 Projects: a directory a conversation works in

★ **A project is a directory, and a conversation belongs to one.** The agent of that
conversation reads and writes **in that directory** — not in the directory the server
happens to run in.

Start the server **with a directory** and it serves that one:

```bash
openheron .            # this project: one group in the sidebar, one working directory
openheron              # every project: one group per project in the sidebar
```

★ The directory you name is **registered** in the project table on the first start — naming
a directory is a statement about it, not a guess. ★ Start it without one and the table
stays as it is: the conversations that belong to no project work in the **default
project root** (`<openheron-root>/projects/default`).

★ **The table is yours**: `state/projects.json` is a plain file, and you may read it or
edit it. It is the **only** truth about which conversation belongs to which project —
delete it and every conversation falls back to "no project" (nothing is lost: the
transcripts, the uploads and the checkpoints all live in the data dir).

```json
{
  "version": 1,
  "projects": [
    { "id": "openheron", "name": "openheron", "root": "/home/you/code/openheron", "order": 0, "sessions": ["…"] }
  ]
}
```

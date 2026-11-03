---
title: "The config root: where your configuration lives"
chapter: "3"
order: 3
chapterSlug: "config-root"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

**Exactly three levels, no upward search**:

```
--config-dir  →  $OPENHERON_CONFIG_DIR  →  <project-root>/.openheron
```

- **The default level is created for you** when it does not exist.
- The first two levels are **not** created when they point nowhere — a typo must not
  silently grow an empty configuration tree. Startup then reports
  `config: load <path>: ...`, which tells you where it went wrong.
- The config root **does not depend on "where the process was started from"**: running
  `openheron` in a subdirectory still reads the same configuration.

If the default root has no `agents/main.md`, startup says so directly:

```
no configuration at /your/project/.openheron: run `openheron init` to create one
```

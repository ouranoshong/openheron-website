---
title: "命令行速查"
chapter: "8"
order: 8
chapterSlug: "commands"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

```
openheron [--openheron-root <path>] [--config-root <path>]      start the server
           [--default-project-root <path>] [dir]
openheron init [options]                                   generate a minimal runnable configuration
openheron secret set <llm|mcp> <name>                      store a key in the keyring (the value is read from stdin)
openheron secret get <llm|mcp> <name>                      print the key that is in effect
openheron secret list [--json]                             the entities and which key is in force
openheron secret remove <llm|mcp> <name>                   remove one entry
openheron secret remove <llm|mcp>                          remove every entry of that group
openheron kb index [--config-root] [--json] [files...]     build the index
openheron kb search [--config-root] <query>                search
openheron kb status [--config-root] [--json]               inspect the index
openheron version                                         print the version
```

★ 那个**目录**就是这个进程关注的项目 —— 它同时也是默认项目根，除非 `--default-project-root`
另有说法。flag 要写在它**前面**：`openheron --config-root ./cfg .`。

---
title: "Command-line reference"
chapter: "8"
order: 8
chapterSlug: "commands"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
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

★ The **directory** is the project this process focuses on — it is also the default project
root, unless `--default-project-root` says otherwise. The flags come **before** it:
`openheron --config-root ./cfg .`.

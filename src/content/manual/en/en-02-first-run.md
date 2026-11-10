---
title: "First run"
chapter: "2"
order: 2
chapterSlug: "first-run"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

```bash
cd /your/project
openheron init                      # generate the configuration in the current directory
export DEEPSEEK_API_KEY=sk-...     # secrets are read from the environment only
openheron
```

Open <http://localhost:8080>.

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

★ The three MCP servers need `uvx` on the PATH, and the two stdio ones download their
package on the first start — a server that cannot be started costs that server's tools
and nothing else (§4.7).

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

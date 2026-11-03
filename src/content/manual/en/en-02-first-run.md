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

`openheron init` writes six files:

```
your/project/
└── .openheron/
    ├── agents/
    │   ├── main.md          # entry agent: understand, split, delegate, verify
    │   └── task.md          # executor agent: does the actual work
    ├── llm/
    │   └── deepseek.yaml    # model profile
    ├── policy/
    │   ├── permissions.yaml # approval policy
    │   └── limits.yaml      # caps on quantities
    └── server/
        └── config.yaml      # process parameters (not hot-reloaded)
```

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
| `--no-policy` | Do not generate the `policy/` section (`permissions.yaml` and `limits.yaml`) |
| `--tools` | Also generate the tool configurations under `tools/` |
| `--force` | Overwrite existing files |
| `--dry-run` | Print what would be written, write nothing |
| `--json` | Machine-readable output |

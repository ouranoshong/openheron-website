---
title: "FAQ"
chapter: "10"
order: 10
chapterSlug: "faq"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

**Q: Startup says `no configuration at ...: run \`openheron init\` to create one`**
The config root is empty. Run `openheron init` in the project root.

**Q: `config: load <path>: agents/main.md does not exist or could not be parsed`**
One of two things: the config root points at the wrong place (fix it with
`--config-dir` or `$OPENHERON_CONFIG_DIR`), or the frontmatter of `agents/main.md` has
a wrong key.

**Q: I changed `agents/main.md` and nothing happened?**
`agents/` is hot-reloaded, so it should have taken effect. If it did not, look for the
reload error in the startup log. `server/` and `skills/` are **not** hot-reloaded and
need a restart.

**Q: The model does not think — `reasoning: high` seems to do nothing?**
Most likely the model profile **does not declare the `high` tier**. A tier missing from
the table is silently ignored. Add it under `models[].reasoning` in
`llm/<vendor>.yaml`.

**Q: `kb_search` finds nothing, or finds the wrong things?**
Run `openheron kb status` first: `lexical-only retrieval` means there are no vectors
and the hybrid score is not in effect. Configure an embedding model and re-index.

**Q: An agent cannot call `write_file`?**
Two possibilities: it is disabled for that agent by `disabled_tools`, or it is denied
globally by `deny`. Check `GET /v2/agents/:agentId` for the effective tool table. By
default `main` has `write_file`/`edit_file`/`execute` disabled — in the factory
configuration it only orchestrates.

**Q: `/v2/run` says `threadId is required`**
Create the session with `POST /v2/sessions` first.

**Q: The port is taken / the interface will not open?**
Change the port in `listen_addr`, or override it with the `LISTEN_ADDR` environment
variable.

**Q: How do I see what the server actually loaded?**
`GET /v2/config` returns the effective configuration; `GET /v2/health` returns the
health status and any `deferred` notices; `GET /v2/runtime` returns the runtime status.
The startup log also prints the config root path.

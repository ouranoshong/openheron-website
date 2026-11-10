---
title: "常见问题"
chapter: "10"
order: 10
chapterSlug: "faq"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

**Q：启动报 `no configuration at ...: run \`openheron init\` to create one`**
配置根是空的。在项目根跑 `openheron init`。

**Q：报 `config: load <path>: agents/main.md does not exist or could not be parsed`**
两件事之一：配置根指错了（用 `--config-dir` 或 `$OPENHERON_CONFIG_DIR` 指对），
或者 `agents/main.md` 的 frontmatter 写错了键。

**Q：改了 `agents/main.md` 没生效？**
`agents/` 是热重载的，应该自动生效。没生效看启动日志里的 reload 错误。
`server/` 和 `skills/` **不热重载**，要重启。

**Q：模型不思考，`reasoning: high` 像是没用？**
多半是模型档案里**没有声明 `high` 档**。档位表缺哪档，那档就被静默忽略。
去 `llm/<vendor>.yaml` 的 `models[].reasoning` 补上。

**Q：`kb_search` 找不到东西 / 搜得不准？**
先 `openheron kb status`：显示 `lexical-only retrieval` 说明没有向量，
混合打分没生效。配好 embedding 模型后重新 `kb index`。

**Q：Agent 调不动 `write_file`？**
两种可能：它不在这个 Agent 的 `tools:` 清单里 —— 那模型连看都看不见 —— 或者它
本来就只是个 `ask` 档工具，而那张审批卡片没人答。查
`GET /v2/agents/:agentId` 看生效工具表。默认 `main` 是禁用了
`write_file`/`edit_file`/`execute` 的 —— 出厂配置里它只做编排。

**Q：`/v2/run` 报 `threadId is required`**
先 `POST /v2/sessions` 建会话。

**Q：模型看不见 MCP 服务器的工具？**
打开 `/mcps`（见 §6.8）。这个 Agent 没挂载的服务器写着 `unused`；够不着的工具写着
`blocked`，括号里的理由会点名 `mcps` —— 这个 Agent 没挂载那个 server。
写着 `unreachable` 的服务器旁边带着出错原因，说清它为什么起不来。

**Q：MCP 服务器起不来？**
启动报错会点名是哪个文件的哪个字段。`mcps/` 是热的，所以改完下一轮就生效 —— 不用重启。

**Q：面板说某台服务器 `starting`？**
它正在起：配置一被读到，服务器就在后台起起来。它带来的工具在**下一轮**进来 ——
按 **Refresh** 就看得见。

**Q：端口被占 / 界面打不开？**
`listen_addr` 改端口，或用环境变量 `LISTEN_ADDR` 覆盖。

**Q：想看服务到底加载了什么？**
`GET /v2/config` 返回生效配置；`GET /v2/health` 返回健康状态和 `deferred` 告警；
`GET /v2/runtime` 返回运行时状态。启动日志也会打印配置根路径。

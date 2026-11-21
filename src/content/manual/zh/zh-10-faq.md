---
title: "常见问题"
chapter: "10"
order: 10
chapterSlug: "faq"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

**Q：启动报 ``no configuration at ...: run `openheron init` to create one``**
配置根是空的，而服务端没能自己写出来 —— 它会在第一次启动时写。启动日志里说了自动
初始化为什么失败；在项目根跑 `openheron init` 做的是同一件事，只是模型和 provider
由你定。

**Q：报 `config: load <path>: agents/main.md does not exist or could not be parsed`**
两件事之一：配置根指错了（用 `--config-root` 或 `$OPENHERON_CONFIG_ROOT` 指对），
或者 `agents/main.md` 的 frontmatter 写错了键。

**Q：改了 `agents/main.md` 没生效？**
`agents/` 是热重载的，应该自动生效。没生效看启动日志里的 reload 错误。
`server/` **不热重载**，要重启。`skills/` 也是热的 —— 配置根下的 `SKILL.md` 下一轮就生效
（§4.6）—— 但技能目录在别处就不在监视范围内。

**Q：改了某个 Agent 的文件，别的 Agent 也会跟着变吗？**
不会，而这正是要点。一份改动只到达读了那个文件的 Agent：下一轮重建的是你改的那个
Agent 和它的父 Agent，其余的照旧留着。改之前想知道这个集合里有哪些，带 `impact` 的
`config_get` 会告诉你（§4.9）。

**Q：模型不思考，`reasoning: high` 像是没用？**
多半是模型档案里**没有声明 `high` 档**。这不是静默无效：配置**根本加载不起来**，
报错会点名是哪个 Agent、哪一档、模型声明了哪几档。
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
`listen_addr` 改端口，或用环境变量 `OPENHERON_LISTEN_ADDR` 覆盖。★ 地址里要留着主机名：
`127.0.0.1:9090` 是安全写法，光一个 `:9090` 绑的是所有网卡。

**Q：想看服务到底加载了什么？**
`GET /v2/config` 返回生效配置；`GET /v2/health` 返回健康状态和 `deferred` 告警；
`GET /v2/runtime` 返回运行时状态。启动日志也会打印配置根路径。

**Q：Windows 上 agent 的 shell 工具失败，或者跑的是模型按另一套系统写的命令？**
`execute` 工具在服务启动时挑自己的 shell —— 见 §1.3（「在 Windows 上」）。它优先要
POSIX shell，机器上一个都没有时退回 `cmd.exe`；两种情况工具的描述都会告诉模型
该写哪一套方言，于是命令是照着真正跑它的那个 shell 写的。★ 启动日志会打印它挑中
的是哪个 shell。

**Q：没有 ripgrep 时，`grep` 工具是不是就弱了？**
它用自己的引擎搜：同样的正则、同样的上限、同样的预算，对「这个文件在不在」给出的
答案也一样。少的是：不读 `.gitignore`，认识的文件类型更少 —— 不认识的类型会被
拒绝，而不是猜一个。★ 启动日志会打印挑中的是哪个引擎；想用另一个就装上 ripgrep。

**Q：密钥该放哪？**
不放配置里。**provider 的文件名**说了算：`llm/deepseek.yaml` 就是环境变量
`LLM_DEEPSEEK_API_KEY`，或者钥匙串条目 `llm:deepseek` —— 环境变量优先。
用 `openheron secret set llm deepseek` 存一把，或者在设置对话框的 **Secrets**
标签页里存（§6.3）；要让容器或 CI runner 看见，就 export 那个变量（§4.2）。

**Q：启动时说 `api_key` 这一行不再被读了？**
那个档案里还留着旧的那一行。★ 把它删掉：密钥已经不在配置里了，而那句话会点名
替代它的变量与钥匙串条目（§4.2）。

**Q：用桌面版时界面没出来，但浏览器弹了？**
内嵌窗口起不来（多半是缺 WebView2 Runtime 或 `WebKitGTK`）。这是**降级路径，不是故障** ——
用浏览器完全一样；想用内嵌窗口就把那个运行时装上。

**Q：桌面版的托盘图标不出现（Linux）？**
你的桌面环境**没有托盘宿主**：托盘走的是 StatusNotifier 协议，得有一个 SNI 宿主来显示它。
KDE Plasma 自带；★ **GNOME 默认不带** ⇒ 装个 AppIndicator 扩展
（Debian/Ubuntu：`gnome-shell-extension-appindicator`）并启用。
日志里搜 `systray error` 能看出是不是它。

**Q：桌面版起不来，提示 openheron 太旧？**
★ 桌面版**不认版本号、只认能力** —— 启动前跑一次 `openheron --help`，看有没有
`--config-root` / `--openheron-root`。没有就拒绝启动：手动更新 openheron（§1.1），
再回来启动它。

**Q：桌面版出问题了看哪儿？**
看它自己的日志：`%LOCALAPPDATA%\openheron-desktop\logs\desktop.log`
（Linux 上是 `~/.config/openheron-desktop/logs/desktop.log`）。
里面只有端口、参数和子进程的原始输出，**不会有密钥值**。
★ 绝大多数状态，点一次托盘的「**重启服务**」就能恢复（§2.4）。

**Q：桌面版能固定端口吗？**
★ **不能** —— 强制回环 + 每次重选端口是硬约束，不给开关（§2.4）。

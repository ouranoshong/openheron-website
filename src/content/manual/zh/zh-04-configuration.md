---
title: "配置怎么写"
chapter: "4"
order: 4
chapterSlug: "configuration"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

## 4.1 Agent（`agents/<name>.md`）

一个 Agent 是一个 markdown 文件：**frontmatter + 正文**。正文就是给模型看的提示词。

```markdown
---
description: "task: the concrete executor. Writes files per the task order."
model: deepseek/deepseek-flash
max_iterations: 50
reasoning: low
tools: [ls, read_file, write_file, edit_file, glob, grep, execute, write_todos]
mcps: []
summarize_at: 80%
---

你是执行 Agent。收到任务后：
1. 先读相关文件
2. 按任务单逐项修改
3. 改完跑一遍测试，把失败项原样贴出来
```

frontmatter 可用键：

| 键 | 说明 |
|---|---|
| `description` | 这个 Agent 干什么用的（父 Agent 靠它决定委派给谁） |
| `model` | `<vendor>/<model>`，**必填**，不继承也不回退 |
| `max_iterations` | 工具循环的轮数上限 |
| `summarize_at` | 这个 Agent 的上下文什么时候被**压缩**成摘要：模型窗口的 `80%`（默认）、绝对 token 数（`104858`）、或 `off` / `0` 表示永不 |
| `subagents` | 它能委派给谁（见 §5） |
| `tools` | **这个 Agent 能用的工具** —— **所有非 MCP 工具**：内置工具、`tools/` 下各文件提供的工具，以及 `config_*` 工具。★ **不写就是一个工具都没有**：这张清单就是全部答案。★ MCP 的工具**不写在这里** —— 挂载那个 server 就会得到它的工具（见 §4.8） |
| `skills` | 这个 Agent 能加载的技能 —— `skills/` 下文件夹的白名单。**不写就是没有技能**，写空列表也一样 |
| `mcps` | 这个 Agent **挂载**的 MCP 服务器 —— **不写就是不起任何服务器**，写空列表也一样。挂载一个就是起一个子进程，**并把它的全部工具交给这个 Agent**（见 §4.8） |
| `temperature` / `max_tokens` | 采样参数 |
| `reasoning` | 思考档位：`off` / `low` / `high` / `max`（名字由厂商档案定义） |

★ **frontmatter 写错一个键就是启动错误**，不会被忽略 —— 这是故意的：
一份静默失效的配置比一份报错的配置难查得多。

★ **`model` 不继承**。父 Agent 用了哪个模型，子 Agent 不会跟着用 —— 每个 Agent 都得自己写。
这正是「专家配专模」的落点。

★ **模型没人声明，只会把那个 Agent 留在树外 —— 不会让 openheron 起不来。** 那个 Agent
会从树里摘掉，每个父 Agent 的 `subagents:` 里也会删掉，理由在四个地方说：启动日志、
`/v2/health`、配置编辑器里**它自己文件上那条灰色的提示**（§6.3），以及会话真的要用它时
拿到的那句错。★ 默认 Agent 也不例外：没有可用的模型时 `main` 同样留在树外，在你改好之前
**没有会话能跑** —— 但 openheron 照常起来，这正是你能打开编辑器改这个文件的原因。
★ 编辑器会拦下造成这种结果的改动：把一个本来能跑的 Agent 指向一个不存在的模型，保存时就被拒。

★ **跑不起来的那条消息说的是原因，不是「超时」。** 如果你要对话的那个 Agent 装不起来，
聊天里给出的就是原因本身 —— `agent "main" is left out of the tree: the model
openai/gpt-4o-mini is not declared under llm/` —— 这一轮以 `agent_unavailable` 这个码结束。
★ 这个码意味着「你的配置坏了」，所以该做的是打开编辑器改文件，而不是把消息再发一遍。

★ **`reasoning` 档位必须在模型档案里声明过才有效**。没声明的档位在**加载配置时就被拒**：
整棵树起不来，报错会点名是哪个 Agent、它要了哪一档、模型声明了哪几档。
详见 §4.2。

★ **`summarize_at` 是长对话活下来的原因**。越过这个点，对话会被一段摘要取代，从那以后
agent 带着摘要往前走。它有四种写法：

| 写法 | 含义 |
|---|---|
| `summarize_at: 80%` | 该 Agent 实际所用模型 `context_window` 的 80% |
| `summarize_at: 104858` | 绝对 token 数 |
| `summarize_at: off` | 永不压缩 —— 上下文一直长到端点拒绝请求 |
| `summarize_at: 0` | 与 `off` 一样 |

不写这个键，Agent 拿到的是**窗口的 80%** —— 自动压缩默认开着。常用区间是 80–90%：
正好填满窗口的请求就是会被拒绝的请求，剩下的那点余量正是摘要自己需要的。

★ **百分比需要窗口**。模型没声明 `context_window`，就没什么可取 80%：那个 Agent 永远不压缩，
而 openheron 加载配置时会说出来。在 `llm/<vendor>.yaml` 里声明 `context_window`，
或者在 Agent 上写一个绝对的 `summarize_at`。

## 4.2 模型档案（`llm/<vendor>.yaml`）

```yaml
type: openai_compat
base_url: https://api.deepseek.com
timeout: 5m

models:
  - id: deepseek-flash
    context_window: 1000000
    reasoning:
      off:  { reasoning_effort: none, thinking: { type: disabled } }
      low:  { reasoning_effort: low,  thinking: { type: enabled } }
      high: { reasoning_effort: high, thinking: { type: enabled } }
      max:  { reasoning_effort: max,  thinking: { type: enabled } }
    reasoning_default: off
```

| 字段 | 说明 |
|---|---|
| `type` | 协议类型，目前是 `openai_compat` |
| `base_url` | 端点，**含路径**，从厂商文档抄 |
| `api_key` | **已退休** —— 密钥来自环境变量还是钥匙串，由 provider 自己的**文件名**说了算（§4.2） |
| `timeout` | 超时，带单位（`5m` / `30m`） |
| `models[].id` | 模型名 |
| `models[].context_window` | 上下文窗口 —— 压缩阈值就是拿它量的 |
| `models[].reasoning` | **档位表**：档位名 → 这个端点实际发什么字段 |
| `models[].reasoning_default` | Agent 没写 `reasoning` 时用哪档 |
| `models[].timeout` | 覆盖厂商级超时（思考模型通常要调大） |
| `hint_keys` | 端点的字段名，用于请求被拒时给出准确提示 |
| `extra` | 厂商级方言，透传给所有请求 |

★ **`api_key:` 已退休。** 还带着这一行的档案**会被拒** —— 加载时拒，从配置编辑器
保存时也拒 —— 而那句话会说清密钥现在从哪来：由 provider 自己的名字推导出来的那个环境
变量与那条钥匙串条目。★ 密钥不该进仓库：它永远不会被写进配置树。

★ **压缩阈值属于 Agent，不属于模型。** `context_window` 是模型的；`summarize_at` 是 Agent 的 ——
这个 Agent 把自己的上下文填到多少才压缩，是它自己的策略。同一个模型可以服务多个策略不同的
Agent。模型档案里留着的 `summarize_at` 不再被读，openheron 加载配置时会说出来。

压缩缩短的是**上下文**，不是**记录**。被压缩掉的消息仍留在记录里、仍读得到；摘要就写在它们
旁边。你自己的话不会在切口处丢失 —— 摘要把它们留住了。

★ **`reasoning` 档位表不是可选的**。它是「Agent 写 `reasoning: high`」与
「这个端点怎么表达 high」之间的翻译层。表里没有的档位**在加载配置时就被拒** ——
整棵树都起不来，报错会说清要的是哪一档、模型声明了哪几档。

### 密钥从哪来

模型档案已经不再提密钥了。★ **密钥从哪来，由 provider 的文件名说了算** ——
`llm/<vendor>.yaml` 里不再有 `api_key:` 这一行，还留着它的文件会被拒（见上面那条）。

对 provider `deepseek` —— 也就是文件 `llm/deepseek.yaml` —— 密钥有两个可能的地方：

| | 在哪 |
|---|---|
| 环境变量（覆盖层） | `LLM_DEEPSEEK_API_KEY` |
| 钥匙串（存放地） | 那一条 `llm:deepseek` |

★ **环境变量优先。** 解析链是：先环境变量，后钥匙串。先问环境变量，是因为它才是
容器、CI runner 或操作者 shell 交给这个进程「就这一轮」的东西；钥匙串是机器自己留着
的。★ 所以变量设着的时候，存在钥匙串里的那条**不在生效位置** —— 界面（§6.3）与
`openheron secret list` 都会把这件事说出来，因为「存了」与「生效」是两个问题。

★ **名字是推导出来的，不是你起的。** `llm/deepseek.yaml` 只可能是 provider
`deepseek`，所以它只可能是 `LLM_DEEPSEEK_API_KEY` 与 `llm:deepseek`。一条规则代替
一张表 —— 而且档案没法和自己的文件名唱反调。★ MCP 那边是同一个规矩：
`mcps/github.yaml` 就是 `MCP_GITHUB_TOKEN` 与钥匙串条目 `mcp:github`（§4.7）。

**放环境变量。** macOS 与 Linux：

```sh
export LLM_DEEPSEEK_API_KEY=sk-...
```

想长期有效，就把这一行写进 `~/.zshrc`（macOS）、`~/.bashrc`（Linux 上的 bash）
或 `~/.profile`（任何 POSIX shell）。★ **macOS 与 Linux 上变量名区分大小写。**
`$env:llm_deepseek_api_key` 在那边是另一个变量，那边这个 provider 就会说自己没有
密钥；Windows 上相反，不区分（§2.2）。

★ **变量要到达的是进程，不是你的登录会话。** `~/.bashrc` 那一行只有**交互式 bash**
会读：systemd 单元、launchd 作业、容器和 CI runner 各自有自己的环境，
它们都不读你的 shell 的 rc 文件。要把它交给真正启动 openheron 的那个东西：

| openheron 跑在哪 | 变量放哪 |
|---|---|
| 终端里 | `export ...`（macOS 与 Linux）/ `$env:... = ...`（Windows，见 §2.2） |
| systemd 单元（Linux） | 单元文件里的 `Environment=LLM_DEEPSEEK_API_KEY=sk-...`，然后 `systemctl daemon-reload` |
| launchd 作业（macOS） | 作业 plist 里的 `EnvironmentVariables` |
| 容器里 | `docker run -e LLM_DEEPSEEK_API_KEY=sk-...`，或 `--env-file .env` |
| CI | runner 自己的密钥库 —— 存变量，不是存密钥 |

**放钥匙串。** 设置对话框的 **Secrets** 标签页（§6.3）能填，命令行也行：

```sh
openheron secret set llm deepseek
```

★ 值是从**标准输入**读的，所以它既不进 shell 历史，也不进进程表。钥匙串是机器自己的
凭据库 —— Windows 凭据管理器、macOS 钥匙串、Linux Secret Service —— 所以放在那儿的
密钥不是你项目里的一个文件。

**`@file:` 这种写法。** 变量里也可以装一个**路径**，而不是密钥本身：

```sh
export LLM_DEEPSEEK_API_KEY='@file:/etc/openheron/deepseek.key'
```

文件里放的就是那个变量本来装的密钥，在加载时读，内容会去掉首尾空白。两件事要知道：

- ★ **相对路径是相对启动 openheron 时所在的那个目录**，不是相对配置根 —— 用绝对路径。
- ★ **路径不存在是启动错误**，不是提醒：
  `config: parse llm/deepseek.yaml: llm/deepseek.yaml: read secret file: open /etc/openheron/deepseek.key: no such file or directory`。
  路径在报错里出现两次 —— 一次是被解析的那个文件，一次是加载器在读的那个文件 ——
  这是加载器自己的说法，不是笔误。
  这个区别是刻意的：变量没设是运行期状态，路径写错是配置本身写错了。

**怎么知道配好了。** 哪个 provider 没密钥，启动日志会点名：

```
[main] config notice notice="llm/deepseek.yaml: no key for this provider: LLM_DEEPSEEK_API_KEY is not set and the keyring holds no llm:deepseek; calls to this endpoint will fail with 401 Unauthorized"
```

★ 这条提醒**不会拦住服务**：openheron 照常起来，Agent 照常建起来，
而那个端点第一次被调用时回的是 `401 Unauthorized`。同一批提醒也在
`GET /v2/config` 与 `GET /v2/health` 的 `deferred` 里。

★ **变量设成空串不等于没设。** `LLM_DEEPSEEK_API_KEY=` —— 设了，但里面是空的 ——
它解析出来的结果是**没有密钥**，而提醒里会明明白白写着
`LLM_DEEPSEEK_API_KEY is set but empty` —— 一个看得见、也改得掉的错误。变量压根没设时
是另一句话：`LLM_DEEPSEEK_API_KEY is not set and the keyring holds no llm:deepseek`。
要看的是 `GET /v2/config` 里的 `hasApiKey` 与 `keySource` 两个字段，那个 provider 条目
长这样：

```json
{"id":"deepseek","baseUrl":"https://api.deepseek.com","hasApiKey":true,"keySource":"env:LLM_DEEPSEEK_API_KEY","models":[{"id":"deepseek-flash","contextWindow":1000000}]}
```

找到密钥时 `hasApiKey` 是 `true`，没有密钥时是 `false` —— 而密钥本身永远不出进程。
`keySource` 说的是**地方**：`env:LLM_DEEPSEEK_API_KEY`、`keyring:llm:deepseek`、
`file:/etc/openheron/deepseek.key` 或者 `none`。★ **把变量掏空的方式决定了你落在
哪一种**：`$env:LLM_DEEPSEEK_API_KEY = ""` 会留下一个空值（提醒是「set but empty」），
`$env:LLM_DEEPSEEK_API_KEY = $null` 是把变量删掉（提醒是「not set」）；
Unix shell 上是 `export LLM_DEEPSEEK_API_KEY=` 与 `unset LLM_DEEPSEEK_API_KEY` 这一对。

## 4.3 哪些工具要问

**你不用去决定。** 没人点名的工具**一律先问**：这一轮暂停，界面上出现审批卡片
（见 §6.2）。默认是安全的那一档 —— 多点一次，换来的是一次没人看见的破坏性调用
不被执行。

档位只有两个：

| 档位 | 含义 |
|---|---|
| `allow` | 直接跑，不问 |
| `ask` | 等你点头 |

**例外只有两处来点**，就这两处：

| 位置 | 它决定什么 |
|---|---|
| 提供这个工具的那个文件里的 `allows:` 行 | 这个文件提供的哪些工具**不用**问；其余一律问 |
| Agent 里的 `tools:` 行 | 这个 Agent **能用的**工具 —— 不在里面的工具就不在它的工具表里，模型连看都看不见 |

★ **没有全局清单。** 没有一份文件让你列出「哪些工具要问」，也没有一份让你列出
「哪些工具谁都不能用」。文件点自己的例外，Agent 点自己的例外，两者从不合并 ——
于是一个 Agent 的生效工具表，永远只靠配置就能回答。

★ **代码自带一份缺省清单，文件只能往上加。** 读取类（`ls` `read_file` `glob` `grep`）
与委派类（`task` `write_todos` `skill`）永远不用问 —— 没有任何文件能把它拿走。
其余的一律要问，直到有文件点了名。

★ **改机器的那三个工具也有自己的文件。** `write_file`、`edit_file`、`execute` 缺省要问，
而放宽它们的地方就是 `tools/filesystem.yaml`：

```yaml
# .openheron/tools/filesystem.yaml
allows: [write_file, edit_file, execute]
```

★ 那个文件是**调音旋钮，不是开关**：文件系统工具一直都在，所以它既不能加一个也不能删一个，
只能挪它们的档位。**放宽是文件的活，收窄是 agent 的活**（`tools`）—— 因为收窄是
按 agent 来的，而放宽是关于这个工具本身的决定。

有自己文件的工具，在那个文件里说：

```yaml
# .openheron/tools/http.yaml
methods: [get]
allows: [request_get]
```

`request_get` 不用问；`request_post` 要问 —— 而且 `methods` 不点 `post` 的话它压根
不会被提供。知识库说的是同一件事：`kb.yaml` 放行 `kb_search` —— 检索是读，而
`kb_index` 要往磁盘上的索引里写，所以要问。

MCP server 在它自己的文件里说，用的是**它自己的词汇** —— server 自己的工具名，
不是暴露出来的那些（见 §4.7）：

```yaml
# .openheron/mcps/github.yaml
allows: [read_issue, list_issues]
```

★ **档位不是对工具的判决。** 一个 Agent 根本用不了的工具保留自己的档位，并在理由里
说清：Agent 的生效工具表会报 `blocked`，理由是 `tools`（§4.8）。
没有第三档，也没有全局拒绝 —— 一个工具要么对这个 Agent 可用，要么压根不在它的
工具表里。

★ **没有哪个工具能豁免于自己的文件。** `config_write`（§4.9）改的是配置本身，包括那个
`allows:` 列表会授予它的文件 —— 一个能点名它的文件，授的是重写它自己的工具。所以它和其它
工具一样**默认要点头**，直到 `tools/config.yaml` 点名它；而出厂模板不点名它。

## 4.4 外部工具（`tools/`）

**不用改代码** —— 配置缺失的 provider 什么都不挂，所以写下这个文件才是把工具挂上去的那一步。
当前支持六个文件名：

| 文件 | 提供 |
|---|---|
| `http.yaml` | 通用 HTTP 请求工具 |
| `web_search.yaml` | 网页搜索 |
| `wikipedia.yaml` | 百科查询 |
| `kb.yaml` | 知识库（见 §7） |
| `filesystem.yaml` | 文件系统那一组工具 |
| `config.yaml` | 配置工具自己 |

★ 知识库不是靠文件开关的：真正开关它的是**非空 `corpus_dir`**，而文件只承载设置。文件系统与
配置工具则相反 —— 无论文件在不在，它们都挂着。

★ `tools/` 下**只认这六个文件名**，写别的名字会**启动报错**，不会被静默忽略。

★ **`openheron init` 会写 `tools/` 下的那六个文件** —— 工具配置是这棵树的一部分，
因为出厂的 agent 会点名 `request_get`、`duckduckgo_search` 和 `wikipedia_search`，
而没有 provider 提供的名字会被当成笔误报出来。加 `--no-tools` 那个目录就空着。
★ 对 provider 驱动的工具来说，没写就是没启用：对应的工具不会出现在 agent 的工具表里，
模型也看不见它。文件系统与配置工具则无论如何都挂着 —— 对这两个，文件不在少掉的是
一个例外，不是工具本身。

★ **这个文件的 `allows:` 行决定哪些不用问** —— `tools/http.yaml` 点 `request_get`，
`tools/kb.yaml` 点 `kb_search`。这个文件提供的其余一切都问（§4.3）。

★ **代理是挪边界，不是加边界。** `http.yaml` 和 `web_search.yaml` 有一个可选的 `proxy:` 键。
空值就是**不走代理**：工具自己连目标，并拒绝解析不到公网地址的目标 —— 正是这条拒绝让模型
没法被拿来探这台机器自己的内网。配了代理就是**换掉**这条规则 —— 代理存在的意义就是去够直接
够不到的东西（内网地址不是公网地址，够到它正是代理的用处）—— 所以配了代理之后目标可以是
代理够得到的任何地址，边界就落在代理上。支持的协议是 `http`、`https`、`socks5` 和
`socks5h`；写错协议是**启动报错**。

★ **这个键有三种写法**，第三种是写出来的：`""` 是不走代理，一个 URL 点名那个代理 ——
环境变量被忽略 —— `env` 则把路线交给环境：`HTTP_PROXY`、`HTTPS_PROXY` 和 `NO_PROXY`。
缺省不能是「环境里有什么算什么」：那会让**恰好**导出了代理的机器上每一个工具都改道，
而为此买单的是这台机器的主人。环境变量**只读一次**，在工具被装配的时候 —— 所以事后改环境，
不会让跑着的工具换路线。

```yaml
# .openheron/tools/http.yaml
methods: [get]
proxy: http://127.0.0.1:7890
allows: [request_get]
```

```yaml
# .openheron/tools/http.yaml
methods: [get]
proxy: env
allows: [request_get]
```

★ **模型 API 调用是另一个客户端**：它读环境变量里的 `HTTP_PROXY` 和 `HTTPS_PROXY`，
沙箱 Kit 的凭据替换走的就是这条路。`proxy:` 键是给**工具**用的，只有被点名（`proxy: env`）
的时候才会去看环境变量。

## 4.5 进程参数（`server/config.yaml`）

| 字段 | 默认 | 说明 |
|---|---|---|
| `listen_addr` | `127.0.0.1:8080` | 监听地址 —— 缺省是环回；光一个 `:8080` 绑的是所有网卡（§9） |
| `data_dir` | `state` | 会话与 checkpoint 的存放目录 |
| `static_dir` | `web/dist` | 前端产物目录（`frontend_mode: dir` 时用） |
| `frontend_mode` | `embed` | `embed` 用嵌进二进制的界面，`dir` 读磁盘 |
| `start_timeout` | `60s` | 启动超时 |
| `lease_ttl` | `10m` | 一轮在没有进展的情况下能持有多久的租约——**必须长于 provider 自己的超时** |
| `agent.max_depth` | `1` | 委派深度上限 |
| `watch.enabled` | `true` | 热重载监视器要不要开 —— 关掉它，**任何**改动都得重启才生效 |
| `watch.debounce` | `200ms` | 监视器读到被改的文件之前等多久 |
| `retry.max_retries` | `5` | 一轮里一次模型调用最多重试几次 |
| `log_level` | `info` | `debug`、`info`、`warn`、`error` —— 决定哪些行会进输出 |
| `log_requests` | `false` | 是否在 `debug` 下打印脱敏后的模型请求体与 `tools` 原始字节；等价于 `OPENHERON_LOG_LLM_REQUESTS=1` |
| `log.file` | `""` | 日志写到的文件，相对**大本营**解析 —— 空串 = 只写标准错误。新项目的模板写的是 `logs/openheron.log` |
| `log.console` | `true` | 标准错误是否在文件旁边留一份 —— 新项目的模板设成 `false` |
| `log.max_size_mb` | `20` | 单个日志文件的大小上限 —— `0` = 不限；负值会被归一成 `0` 并写进 `deferred` |
| `log.max_age_days` | `14` | 轮转出来的文件留几天 —— `0` = 不限 |
| `log.max_backups` | `5` | 留几个轮转文件 —— `0` = 不限 |
| `log.compress` | `false` | 轮转出来的文件要不要 gzip |

★ **`server/` 不热重载** —— 改了要重启才生效。所以配置编辑器里它是**只读**的，
提交会报 `section "server" is not editable: it is not hot-reloaded, so changes would need a restart`。

以下环境变量可以覆盖进程参数，优先级高于配置文件：
`OPENHERON_LISTEN_ADDR`、`OPENHERON_DATA_DIR`、`OPENHERON_DEFAULT_PROJECT_ROOT`、
`OPENHERON_FRONTEND_MODE`、`OPENHERON_STATIC_DIR`、
`OPENHERON_LOG_LEVEL`、
`OPENHERON_LOG_FILE`、`OPENHERON_LOG_LLM_REQUESTS`。

★ `data_dir` 与 `log.file` 的基准是**大本营**，`static_dir` 的基准是**项目根**（§3）。

★ `log_requests` 与 `OPENHERON_LOG_LLM_REQUESTS` 是同一个开关的两种写法：前者定项目默认值，
后者给单次运行下定论（**环境变量优先**，变量为空才看配置）。打开后每次模型请求会在 `debug`
下记一行脱敏后的请求体和一行 `tools` 原始字节；两个都关着时，**被拒绝的请求**仍会留下
`tools` 原始字节，因为那一轮最需要留证。它只管内容，不关 `log.file` 的落盘。

★ `log_level` 不是这四个之一时回退 `info`；配置的 `deferred` 提示里带着原因。

★ 日志写到哪儿由两个键决定：`log.file` 指文件（相对**大本营**解析，那儿也是其它运行时状态
的所在地），`log.console` 说标准错误旁边还留不留一份。**代码**的缺省是空路径加 stderr 一份，所以没动过的配置只写标准错误。
★ 新项目拿到的是 `logs/openheron.log`，而 `log.console` 是**关**的：日志进文件，配置
读出之后终端就安静了。之前那些行 —— 以及文件打不开的原因 —— 仍然写标准错误。

★ **有一行永远落在终端上：服务跑在哪个地址。** 它在监听就绪之后打印，`log.file` 与
`log_level` 都藏不住它 —— 地址不是日志记录，是进程对启动它的那个终端说的自己
（`docs/runtime-design.md` §4.4）。

★ **监听地址越过环回时，终端上会多一行**：`the server listens beyond the loopback; anyone who can reach this port can drive the agent`。它走同一条路 —— 所以把日志送进文件的配置，藏不住「这个 agent 已经被网络够得着」这件事。环回时没有话要说，于是不说（`docs/runtime-design.md` §4.4）。

★ 文件按大小轮转，而打不开文件只是告警、不是启动失败：进程留在标准错误上，并把原因写在那儿。

## 4.6 技能（`skills/`）

`skills/<name>/SKILL.md`，按 eino 原生的 skill 约定。

★ skills 的查找**是另一套规则**：先看 `$EINO_EXT_SKILLS_DIR`，再看**配置根自己的**
`skills/`，两处都没有才从**当前目录向上**找 `.openheron/skills`。配置根排在向上探测
前面，是因为配置编辑器就往那儿写 —— 存在配置里却加载不到的技能，是谁也用不了的技能。
向上找是旧布局，它跟配置根「不向上找」不一样 —— skills 是目录树，向上找是为了能用你家
目录里的技能。

★ **一个 Agent 能用哪些技能，由它自己声明**。`agents/<name>.md` 的 `skills` 键是
白名单，名字就是 `skills/` 下的文件夹名：

```yaml
skills: [refactor, review]
```

不写这个键就是**一个都没有** —— 键不写和写空列表是一回事，跟 `tools:` 同一条规矩。
不在名单里的技能不会出现在给模型看的技能清单里，点名去调也会失败 —— 看不见的东西调不到。
名单里写了目录里没有的名字，Agent 装配时日志会报出来，不会被忽略。

★ **一个技能就是一层文件夹，编辑器问的就是这个名字。** `/settings` 把每个分区显示成文件树
里的一个文件夹，于是技能长成 `skills/code-review/SKILL.md`：你只填技能名，文件夹里那个
文件名永远是 `SKILL.md`。这个名就是你在 Agent 的 `skills:` 里写的那个，而且必须能被读回来 ——
小写字母和数字，单个 `-` 或 `_` 分隔，所以 `code-review` 和 `code_review` 是两个技能。

★ **当 openheron 从别处读技能时，这个分区会说明并拒绝保存。** 上面那条规则意味着生效的目录
可能不是 `<配置根>/skills/`。往一个没人加载的目录里写等于什么都没改，所以编辑器会显示进程实际
在读的那个目录，并把这一分区标成只读。启动时**一个技能目录都没找到**不算这种情况：那时
`<配置根>/skills/` 正是下次启动会去找的地方，在那儿建第一个技能是有效的。

★ **`skills/` 是热的。** 改配置根下的 `SKILL.md` 下一轮就生效 —— 不用重启。技能目录在**别处**
就不在监视范围内：那里的改动要等下次启动才到达 Agent。

## 4.7 MCP 服务器（`mcps/`）

MCP 服务器是一个把工具提供给模型的程序。openheron **一个文件挂一个服务器**，
而且**文件在就是定义** —— 没有 `enabled` 这个键。

`mcps/<server>.yaml` —— 文件名就是服务器的名字：

```yaml
# .openheron/mcps/github.yaml
transport: stdio
command: npx
args: ["-y", "@modelcontextprotocol/server-github"]
env:
  GITHUB_TOKEN: ${MCP_GITHUB_TOKEN}
timeout: 30s
call_timeout: 60s
tools: []
allows: [read_issue, list_issues]
```

同一个服务器走 HTTP 的写法：

```yaml
# .openheron/mcps/remote.yaml
transport: http
url: https://mcp.example.com/mcp
headers:
  Authorization: Bearer ${MCP_REMOTE_TOKEN}
timeout: 30s
call_timeout: 60s
```

| 字段 | 用在哪 | 说明 |
|---|---|---|
| `transport` | 两者 | `stdio`（一个子进程）或 `http`（**streamable HTTP** —— 没有 SSE 这个传输方式）。默认 `stdio` |
| `command` | stdio | 要执行的命令。**必填** |
| `args` | stdio | 命令的参数 |
| `env` | stdio | 子进程的环境变量，叠在继承来的那份之上 |
| `url` | http | 服务器的地址。**必填** |
| `headers` | http | 每次请求都带上 |
| `timeout` | 两者 | 连接、握手、列工具的时限（默认 `30s`） |
| `call_timeout` | 两者 | 单次工具调用的时限（默认 `60s`） |
| `tools` | 两者 | 对**服务器自己的**工具名的**过滤**；不写或写空就是全都要 |
| `allows` | 两者 | 服务器自己的工具名里**不用问**的那些；其余都要问 |

★ **文件名必须匹配 `^[a-z0-9]+(_[a-z0-9]+)*$`。** 带一串连续下划线的名字会被拒绝：
暴露出来的名字 `mcp__a__b__x` 以后没法反解回来 —— 那是服务器 `a` 带工具 `b__x`，
还是服务器 `a__b` 带工具 `x`？

★ **凭据的名字由文件名推导。** `mcps/github.yaml` 就是服务器 `github`，所以它的令牌是
`MCP_GITHUB_TOKEN`，钥匙串条目是 `mcp:github` —— 与模型那边同一个规矩（§4.2）。
★ 于是 `env:` 或 `headers:` 里的 `${MCP_GITHUB_TOKEN}` 不是「碰巧拼成这样的变量」：
它就是**那台服务器的令牌**，同样先查环境变量、后查钥匙串。★ 其余的 `${NAME}`
保持原意 —— 一次普通的环境变量查找。

★ **`openheron init` 写三台服务器** —— `mcps/fetch.yaml`、`mcps/time.yaml` 和
`mcps/deepwiki.yaml`。★ 每一份都**定义**一台服务器，所以一份解析不了的文件不是
「服务器关着」，而是「配置加载不了」。★ 两个 stdio 的跑 `uvx`，而 `uvx` 默认没装 ——
于是服务器起不来，**日志里说一句，Agent 照跑**。★ **自己在 `mcps/` 下写一份文件、
填上自己的 command，这个动作本身就是定义那台服务器**；复制那三个之一、改掉 `command:`
就行。

★ **那个不安装的示例** —— 模板里的 `mcps/_example.yaml` —— 是设置界面新建服务器时的
骨架。它是脚手架，不是要安装的文件，所以 `openheron init` 不写它。

★ **stdio 服务器的第一次启动可能很慢，而 `timeout:` 就是这次启动的上限。** 命令常常
是一个包运行器（`npx`、`uvx`），第一次跑会把服务器装上 —— 那次安装是启动的一部分，
所以一台要装一分钟的服务器，在 `timeout: 30s` 里起不来。
★ 于是它就根本起不来，而这一轮照跑，只是没有它的工具：自己手动跑一次那条命令把缓存
捂热，或者给那个文件写一个更长的 `timeout:`。

★ **会在启动时报错的**：写了不认识的 `transport`；stdio 服务器没有 `command`；
http 服务器没有 `url`；http 服务器上写了 `env:`；Agent 点名了一个不存在的服务器。

★ **不会启动报错的**：`timeout` 写坏了 —— 它退回到默认值，并在告警里报出来；
`env:` 里的 `${ENV}` 没设 —— 那一条被跳过，并在告警里报出来。写错的 timeout 改的是
「等多久」，不是「会怎样」，所以它不该拦住服务器启动。

**你会看到的名字。** 服务器自己的工具 `create_issue` 到模型那里叫
`mcp__github__create_issue`。服务器自己的名字和暴露出来的名字在 `/mcps` 面板里都列出来
（见 §6.8）。

★ **文件里不必写出凭据的名字。** 在沙箱里那个变量装的是 `credential@1` 哨兵，
宿主上的代理在出网时才把真值换上去 —— 于是哨兵顺着继承的环境到达服务器，
http 服务器的 `headers:` 也是一回事。

★ **`mcps/` 是热的。** 改了下一轮就生效 —— 不用重启。

## 4.8 一个 Agent 能拿到哪些服务器

**Agent frontmatter 里的 `mcps:` 键**决定这个 Agent 能拿到哪些服务器 —— 而挂载一个
**就是**授予：

```yaml
---
model: deepseek/deepseek-flash
mcps: [github]
---
```

| `mcps:` 这个键 | 含义 |
|---|---|
| 不写 | **不起**任何服务器 |
| `[]` | **一个都没有** |
| `[github]` | 正好这些服务器 —— 连同它们的全部工具 |

★ 子 Agent 有**自己**的名单，和它自己的 `skills`、`tools` 并排 —— 读的是正在跑的
那个 Agent 的名单，不是根 Agent 的。

★ **挂载就是授予。** `mcps:` 说哪些服务器被**拉起来**，而这个 Agent **拿到了那个服务器
的全部工具** —— 不需要再写第二份清单。

★ **`tools:` 点名的是所有非 MCP 工具。** 写进去的 `mcp__<server>__*` 不授予任何东西：它会被丢弃，
配置会报一条**提示**说清这件事。那个 server 该写进 `mcps:`。

★ **审批与挂载是两件事。** 挂载把工具交给 Agent；而某个工具要不要点头，由那个 server
自己的文件（`mcps/<server>.yaml`）决定，而那里的缺省是 `ask` ——
**挂载不等于放行**。

**`tools` 接受结尾的 `*` 前缀模式。** 一个精确的名字，或一个**结尾**的 `*`：

```yaml
tools: [ls, read_file, config_*]
```

- `config_*` —— 每一个以 `config_` 开头的工具。
- `ls` —— 就那一个工具。

★ **`mcp*foo` 和单独一个 `*` 会在启动时报错。** 只有**结尾**的 `*` 才是前缀模式，
而单独一个 `*` 等于在一张「说明有什么」的清单里写「什么都有」：一条作用范围和字面读法
不一致的规则，就是一次无声的错配。

## 4.9 配置工具

有六个工具让 Agent 读取并修改**它自己跑在其中的那份配置**。它们总是被挂上，而和别的
非 MCP 工具一样，只有 `tools:` 清单点了名的 Agent 才**看得见**它们：

| 工具 | 它回答什么 | 答的是哪一边 | 档位 |
|---|---|---|---|
| `config_get` | 单个文件（`{path}`：正文、revision、是否热加载），或 `{}`：分区表、现有文件、以及**进程手里**那份配置。带 `impact` 时它答的是另一个问题：谁依赖这个文件，下一轮会重建谁 | 单个文件的正文来自**磁盘**（`disk`）；概览两边都带 | allow —— 由 `tools/config.yaml` 点名；没有它就问 |
| `config_validate` | `{path, content}`：这份内容能不能加载，**错在第几行** —— 行号由服务端给。`{}`：检查磁盘上这棵树 | **磁盘**（`disk`） | allow —— 由 `tools/config.yaml` 点名；没有它就问 |
| `config_template` | `{path}`：这个文件从什么骨架开始。`{section}`：那个分区的模板。都不给：一份「能问什么」的索引 | 两边都不是 —— 骨架既不是文件也不是树 | allow —— 由 `tools/config.yaml` 点名；没有它就问 |
| `config_notices` | loader 发现了但没拒绝的事：改了名的键、退休的目录、回落到缺省的值 | **运行中**那棵树（`running`） | allow —— 由 `tools/config.yaml` 点名；没有它就问 |
| `config_tier` | `{tool}`：它要不要点头。`{agent}`：那个 Agent 的工具与各自档位。都不给：缺省档位与整张例外表。答案用的是**本轮跑着的那棵树**，本轮刚写入的 Agent 还看不见 —— 工具会明说这一点，而不是假装它不存在 | **运行中**那棵树（`running`） | allow —— 由 `tools/config.yaml` 点名；没有它就问 |
| `config_write` | 写一个文件：对整棵树预检、对你读到的 revision 校验、合并失败就整份拒绝。**下一轮**生效 —— `applied` 说的是监视器会接住这份改动，不是说本轮就能看见。带 `append` 时它把内容**加到**文件末尾，而不是替换整个文件 —— 全文装不进一次调用时，文件就是这么写出来的 | 写入落在**磁盘**上；答案里两边都带 | **ask** —— 出厂文件不点名它；`tools/config.yaml` 可以点 |

★ **每个答案都说自己答的是哪一边。** 那个字段叫 `source`，取值是 `disk`（此刻磁盘上的
文件）或 `running`（本轮据以建树的那棵）。两者并不矛盾 —— 它们答的是不同的问题：本轮早先
写下的改动已经在磁盘的正文里，还不在运行中的树里。

★ **概览与写入的答案改带两个版本号**：`runningVersion` 与 `diskVersion`。只要一份改动还没
被接住，这两个号就不一样 —— 而这个差别正是「我的改动落地了吗」的答案。

★ **比一次调用更长的文件是分块写的。** `config_write` 替换整个文件，而一次工具调用受模型
自己的输出上限约束 —— 所以全文装不进一次调用的文件是分块写的：第一块替换文件，之后每一块
带 `append`，加到磁盘上已有的内容后面。每一块都走同一套闸门，所以磁盘上的文件在**每一块**
之后都是能加载的。

★ **模型没写完的调用是被拒绝的，不是被执行的。** 输出撞到模型的 token 上限时，这次工具
调用的参数是不完整的 —— 服务端拒绝这次调用，并且把这件事说清楚。没有东西被写下，也不弹
审批卡片；模型被告知这一次少带点。

★ **`config_get` 还有第二个问题：`impact`。** 它不读文件，而是回答「谁依赖这个文件，
下一轮会重建谁」：

| 问法 | 里面有什么 |
|---|---|
| 带 `path` | `dependents`（这个文件对哪些 Agent 有话说）、`rebuilds`（下一轮会重建的 Agent）、`changed`（这个文件对某个 Agent 的贡献动了吗），以及改动没法不重启就生效时的 `requiresRestart` |
| 不带 | `changedFiles`（对某个 Agent 的贡献动过的那些文件），以及同样那份 `rebuilds` |

★ **影响范围的答案来自运行中那棵树**（`running`），尽管它拿磁盘跟那棵树比：它走的依赖图
是运行中那棵树的，答的是「磁盘会把那棵树改成什么样」。所以带 `path` 的 `config_get` 答
`disk`，带 `impact` 的 `config_get` 答 `running` —— 两个问题，两边。

★ **一份改动只到达读了那个文件的 Agent。** 下一轮重建的是**自己的依赖动过**的那些
Agent —— 从没读过那个被改文件的 Agent，手里那份原样保留。所以改一个 Agent 的文件，
重建的是它和它的父 Agent，其余的树不动。

★ **`dependents` 是直接的，`rebuilds` 是传递的。** 父 Agent 带着子 Agent 的身份，所以子
Agent 一变，父也得重建：改 `agents/skill-expert.md`，`dependents` 里只有 `skill-expert`
自己，`rebuilds` 里还有它的父。

★ **`requiresRestart` 是冷分区上诚实的答案。** `server/` 下的文件配的是进程，不是
Agent：没有任何东西到达 Agent，所以答案是「什么都不会变，而且你得重启」，而不是「什么
都不会发生」。

```markdown
---
# .openheron/agents/main.md
tools: [ls, read_file, glob, grep, task, write_todos, config_get, config_validate]
---
```

★ **先给 `config_get` 和 `config_validate`，再给 `config_write`。** 前两个只读；第三个
改配置，而且每次都会停下来等审批。能校验不能写的 Agent 是个有用的审阅者；只会写的
Agent 是一次迟早要来的加载错误。

★ **`config_write` 写不了 `server/`，而 `config_get` 读得了。** 那一节配置的是进程自己，
不热加载，改了要重启 —— 所以写入路径直接拒绝它，而不是存下去一个悄悄不生效的值。
读是另一个问题，而且正是 agent 想知道「进程到底跑着什么」时会问的那个。

★ **文件工具走的是同一套检查。** `write_file` 与 `edit_file` 落在配置根里的路径会交给
配置服务，于是同样的闸门照跑：树必须还装得上、模型档案里不许落一条 `api_key`、能跑的
Agent 不许从树里消失。★ `edit_file` 也经服务读文件，所以它带着 revision，跟它抢跑的那次
改动会被拒掉；`write_file` 不带 revision，所以整篇写入是「后写者赢」—— 闸门照样跑。

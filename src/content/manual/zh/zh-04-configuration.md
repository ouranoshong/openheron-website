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
| `summarize_at` | 这个 Agent 的上下文什么时候被**压缩**成摘要：模型窗口的 `80%`（默认）、绝对 token 数（`104858`）、或 `0` 表示永不 |
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

★ **`reasoning` 档位必须在模型档案里声明过才有效**。没声明的档位会被**静默忽略**：
Agent 写着 `reasoning: high`，而端点没有 `high`，实际效果是「完全不思考」，且没有任何报错。
详见 §4.2。

★ **`summarize_at` 是长对话活下来的原因**。越过这个点，对话会被一段摘要取代，从那以后
agent 带着摘要往前走。它有三种写法：

| 写法 | 含义 |
|---|---|
| `summarize_at: 80%` | 该 Agent 实际所用模型 `context_window` 的 80% |
| `summarize_at: 104858` | 绝对 token 数 |
| `summarize_at: 0` | 永不压缩 —— 上下文一直长到端点拒绝请求 |

不写这个键，Agent 拿到的是**窗口的 80%** —— 自动压缩默认开着。常用区间是 80–90%：
正好填满窗口的请求就是会被拒绝的请求，剩下的那点余量正是摘要自己需要的。

★ **百分比需要窗口**。模型没声明 `context_window`，就没什么可取 80%：那个 Agent 永远不压缩，
而 openheron 加载配置时会说出来。在 `llm/<vendor>.yaml` 里声明 `context_window`，
或者在 Agent 上写一个绝对的 `summarize_at`。

## 4.2 模型档案（`llm/<vendor>.yaml`）

```yaml
type: openai_compat
base_url: https://api.deepseek.com
api_key: ${DEEPSEEK_API_KEY}
timeout: 5m

models:
  - id: deepseek-flash
    context_window: 131072
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
| `api_key` | **环境变量名**，写成 `${NAME}` —— 不能写字面量 |
| `timeout` | 超时，带单位（`5m` / `30m`） |
| `models[].id` | 模型名 |
| `models[].context_window` | 上下文窗口 —— 压缩阈值就是拿它量的 |
| `models[].reasoning` | **档位表**：档位名 → 这个端点实际发什么字段 |
| `models[].reasoning_default` | Agent 没写 `reasoning` 时用哪档 |
| `models[].timeout` | 覆盖厂商级超时（思考模型通常要调大） |
| `hint_keys` | 端点的字段名，用于请求被拒时给出准确提示 |
| `extra` | 厂商级方言，透传给所有请求 |

★ **`api_key` 只能写环境变量名**（`${OPENAI_API_KEY}`）或文件引用（`@file:/path`）。
在配置里写字面量密钥，配置编辑器会直接拒绝保存 —— 密钥不该进仓库。

★ **压缩阈值属于 Agent，不属于模型。** `context_window` 是模型的；`summarize_at` 是 Agent 的 ——
这个 Agent 把自己的上下文填到多少才压缩，是它自己的策略。同一个模型可以服务多个策略不同的
Agent。模型档案里留着的 `summarize_at` 不再被读，openheron 加载配置时会说出来。

压缩缩短的是**上下文**，不是**记录**。被压缩掉的消息仍留在记录里、仍读得到；摘要就写在它们
旁边。你自己的话不会在切口处丢失 —— 摘要把它们留住了。

★ **`reasoning` 档位表不是可选的**。它是「Agent 写 `reasoning: high`」与
「这个端点怎么表达 high」之间的翻译层。表里没有的档位会被静默忽略，
于是「开了 high 档却不思考」这个坑会以最隐蔽的方式出现。

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

★ **有一个例外放宽不了。** `config_write`（§4.9）改的是配置本身，包括那个 `allows:`
列表会授予它的文件 —— 一个能点名它的文件，授的是重写它自己的工具。所以它**永远**要点头，
不管哪个文件怎么说。

## 4.4 外部工具（`tools/`）

**不用改代码** —— 配置缺失的 provider 什么都不挂，所以写下这个文件才是把工具挂上去的那一步。
当前支持四个文件名：

| 文件 | 提供 |
|---|---|
| `http.yaml` | 通用 HTTP 请求工具 |
| `web_search.yaml` | 网页搜索 |
| `wikipedia.yaml` | 百科查询 |
| `kb.yaml` | 知识库（见 §7） |

★ 知识库是唯一的例外：它的文件只承载设置 —— 真正开关它的是**非空 `corpus_dir`**，而不是
文件在不在。

★ `tools/` 下**只认这四个文件名**，写别的名字会**启动报错**，不会被静默忽略。

★ **`openheron init` 会写 `tools/` 下的那五个文件** —— 工具配置是这棵树的一部分，
因为出厂的 agent 会点名 `request_get`、`duckduckgo_search` 和 `wikipedia_search`，
而没有 provider 提供的名字会被当成笔误报出来。加 `--no-tools` 那个目录就空着。
没写就是没启用：对应的工具不会出现在 agent 的工具表里，模型也看不见它。

★ **这个文件的 `allows:` 行决定哪些不用问** —— `tools/http.yaml` 点 `request_get`，
`tools/kb.yaml` 点 `kb_search`。这个文件提供的其余一切都问（§4.3）。

## 4.5 进程参数（`server/config.yaml`）

| 字段 | 默认 | 说明 |
|---|---|---|
| `listen_addr` | `:8080` | 监听地址 |
| `data_dir` | `state` | 会话与 checkpoint 的存放目录 |
| `static_dir` | `web/dist` | 前端产物目录（`frontend_mode: dir` 时用） |
| `frontend_mode` | `embed` | `embed` 用嵌进二进制的界面，`dir` 读磁盘 |
| `start_timeout` | `60s` | 启动超时 |
| `lease_ttl` | `10m` | 一轮在没有进展的情况下能持有多久的租约——**必须长于 provider 自己的超时** |
| `agent.max_depth` | `1` | 委派深度上限 |
| `log_level` | `info` | `debug`、`info`、`warn`、`error` —— 决定哪些行会进输出 |
| `log_requests` | `false` | 是否在 `debug` 下打印脱敏后的模型请求体与 `tools` 原始字节；等价于 `OPENHERON_LOG_LLM_REQUESTS=1` |
| `log.file` | `""` | 日志写到的文件，相对**配置根**解析 —— 空串 = 只写标准错误 |

★ **`server/` 不热重载** —— 改了要重启才生效。所以配置编辑器里它是**只读**的，
提交会报 `section "server" is not editable`。

以下环境变量可以覆盖进程参数，优先级高于配置文件：
`LISTEN_ADDR`、`DATA_DIR`、`PROJECT_ROOT`、`FRONTEND_MODE`、`STATIC_DIR`、`OPENHERON_LOG_LEVEL`、
`OPENHERON_LOG_FILE`、`OPENHERON_LOG_LLM_REQUESTS`。

★ `log_requests` 与 `OPENHERON_LOG_LLM_REQUESTS` 是同一个开关的两种写法：前者定项目默认值，
后者给单次运行下定论（**环境变量优先**，变量为空才看配置）。打开后每次模型请求会在 `debug`
下记一行脱敏后的请求体和一行 `tools` 原始字节；两个都关着时，**被拒绝的请求**仍会留下
`tools` 原始字节，因为那一轮最需要留证。它只管内容，不关 `log.file` 的落盘。

★ `log_level` 不是这四个之一时回退 `info`；配置的 `deferred` 提示里带着原因。

★ 日志默认写标准错误；`log.file` 指了路径就同时落盘 —— 路径相对**配置根**解析。文件按大小
轮转，而打不开文件只是告警、不是启动失败：进程留在标准错误上，并把原因写在那儿。

## 4.6 技能（`skills/`）

`skills/<name>/SKILL.md`，按 eino 原生的 skill 约定。

★ skills 的查找**是另一套规则**：先看 `$EINO_EXT_SKILLS_DIR`，
没有才从**当前目录向上**找 `.openheron/skills`。这跟配置根「不向上找」不一样 ——
skills 是目录树，向上找是为了能用你家目录里的技能。

★ **一个 Agent 能用哪些技能，由它自己声明**。`agents/<name>.md` 的 `skills` 键是
白名单，名字就是 `skills/` 下的文件夹名：

```yaml
skills: [refactor, review]
```

不写这个键就是**目录里的全部技能**；写空列表就是**一个都没有**。不在名单里的技能
不会出现在给模型看的技能清单里，点名去调也会失败 —— 看不见的东西调不到。
名单里写了目录里没有的名字，Agent 装配时日志会报出来，不会被忽略。

★ **一个技能就是一层文件夹，编辑器问的就是这个名字。** `/settings` 把每个分区显示成文件树
里的一个文件夹，于是技能长成 `skills/code-review/SKILL.md`：你只填技能名，文件夹里那个
文件名永远是 `SKILL.md`。这个名就是你在 Agent 的 `skills:` 里写的那个，而且必须能被读回来 ——
小写字母和数字，单个 `-` 或 `_` 分隔，所以 `code-review` 和 `code_review` 是两个技能。

★ **当 openheron 从别处读技能时，这个分区会说明并拒绝保存。** 上面那条规则意味着生效的目录
可能不是 `<配置根>/skills/`。往一个没人加载的目录里写等于什么都没改，所以编辑器会显示进程实际
在读的那个目录，并把这一分区标成只读。启动时**一个技能目录都没找到**不算这种情况：那时
`<配置根>/skills/` 正是下次启动会去找的地方，在那儿建第一个技能是有效的。

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
  GITHUB_TOKEN: ${GITHUB_TOKEN}
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
  Authorization: Bearer ${REMOTE_TOKEN}
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

| 工具 | 它回答什么 | 档位 |
|---|---|---|
| `config_get` | 单个文件（`{path}`：正文、revision、是否热加载），或 `{}`：分区表、现有文件、以及**进程手里**那份配置 | allow |
| `config_validate` | `{path, content}`：这份内容能不能加载，**错在第几行** —— 行号由服务端给。`{}`：检查磁盘上这棵树 | allow |
| `config_template` | `{path}`：这个文件从什么骨架开始。`{section}`：那个分区的模板。都不给：一份「能问什么」的索引 | allow |
| `config_notices` | loader 发现了但没拒绝的事：改了名的键、退休的目录、回落到缺省的值 | allow |
| `config_tier` | `{tool}`：它要不要点头。`{agent}`：那个 Agent 的工具与各自档位。都不给：缺省档位与整张例外表 | allow |
| `config_write` | 写一个文件：对整棵树预检、对你读到的 revision 校验、合并失败就整份拒绝。**下一轮**生效 | **ask** |

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

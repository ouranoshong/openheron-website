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
disabled_tools: [kb_index]
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
| `disabled_tools` | 对**这个 Agent** 生效的工具禁用表 |
| `skills` | 这个 Agent 能用的技能 —— `skills/` 下文件夹的白名单（**不写就是全部**，写空列表就是一个都没有） |
| `temperature` / `max_tokens` | 采样参数 |
| `reasoning` | 思考档位：`off` / `low` / `high` / `max`（名字由厂商档案定义） |

★ **frontmatter 写错一个键就是启动错误**，不会被忽略 —— 这是故意的：
一份静默失效的配置比一份报错的配置难查得多。

★ **`model` 不继承**。父 Agent 用了哪个模型，子 Agent 不会跟着用 —— 每个 Agent 都得自己写。
这正是「专家配专模」的落点。

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

## 4.3 审批策略（`policy/permissions.yaml`）

```yaml
ask:
  - write_file
  - edit_file
  - execute
  - kb_index
deny: []
```

只有两列，语义很直接：

- **在 `ask` 里**：每次调用都要**你点头**。
- **在 `deny` 里**：**谁都不能用**。
- **不在任何一列里**：默认 `allow`（直接放行）。

★ `deny` 是**全局**的。`agents/*.md` 里的 `disabled_tools` 只影响那一个 Agent，
**放松不了外层的 `deny`**。这是子 Agent 唯一放松不了的保证。

## 4.4 外部工具（`tools/`）

**文件存在即启用**，不用改代码。当前支持四个文件名：

| 文件 | 提供 |
|---|---|
| `http.yaml` | 通用 HTTP 请求工具 |
| `web_search.yaml` | 网页搜索 |
| `wikipedia.yaml` | 百科查询 |
| `kb.yaml` | 知识库（见 §7） |

★ `tools/` 下**只认这四个文件名**，写别的名字会**启动报错**，不会被静默忽略。

★ **`openheron init` 默认不写 `tools/` 下的任何文件** —— 这一整个目录要你自己写；加
`--tools` 才会把上面那四个文件写出来。没写就是没启用：对应的工具不会出现在 agent 的
工具表里，模型也看不见它。

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

★ **`server/` 不热重载** —— 改了要重启才生效。所以配置编辑器里它是**只读**的，
提交会报 `section "server" is not editable`。

以下环境变量可以覆盖进程参数，优先级高于配置文件：
`LISTEN_ADDR`、`DATA_DIR`、`PROJECT_ROOT`、`FRONTEND_MODE`、`STATIC_DIR`。

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

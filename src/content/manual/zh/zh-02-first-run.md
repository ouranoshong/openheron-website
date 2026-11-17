---
title: "第一次使用"
chapter: "2"
order: 2
chapterSlug: "first-run"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

## 2.1 跑起来

```bash
cd /your/project
export LLM_DEEPSEEK_API_KEY=sk-...   # 或者放进钥匙串（§4.2）
openheron                             # 配置在第一次启动时写出来
```

打开 <http://localhost:8080>。★ 终端上会打印服务地址 ——
`the server serves on url=http://127.0.0.1:8080` —— 那一行不论日志写到哪里都会出现。

★ 密钥从环境变量**或**钥匙串读，而环境变量优先 —— §4.2 说这两者怎么搭在一起、
各自住在哪；Windows 见 §2.2。

★ **服务端会自己写配置**：在还没有配置的项目里第一次启动时，它写出的那棵树与
`openheron init` 写的完全一样（§2.3），用 DeepSeek 的 provider 模板。★ **密钥不在那
棵树里** —— provider 的名字说了算：`LLM_DEEPSEEK_API_KEY`，或者钥匙串条目
`llm:deepseek`。★ 要换模型、换 provider，或者只想把配置写出来而先不启动
服务端，就用 `openheron init`。

## 2.2 在 Windows 上跑第一次

PowerShell 里，从零到跑起来：

```powershell
cd C:\path\to\your-project
$env:LLM_DEEPSEEK_API_KEY = "sk-..."   # 或者放进钥匙串（§4.2）
openheron
```

★ `openheron` 不在 PATH 上的时候，用全路径调
`%LOCALAPPDATA%\Programs\openheron\openheron.exe`（§1.3）。

`init` 跑完会打印一行提示：

```
the api key is read from LLM_DEEPSEEK_API_KEY when the configuration loads, or from the keyring entry llm:deepseek
store one with: openheron secret set llm <provider>
```

★ 服务端自己写配置时，启动日志里报的是同一件事。

★ 那行提示说的是 **Unix 的 `export`**，在 PowerShell 和 cmd.exe 里都跑不了 —— Windows 上
对应的是 `$env:LLM_DEEPSEEK_API_KEY = "sk-..."`（PowerShell）或
`set LLM_DEEPSEEK_API_KEY=sk-...`（cmd.exe）。

### 密钥怎么设

一把密钥有**两个地方**可放，而 provider 的名字决定它们各叫什么：环境变量
`LLM_DEEPSEEK_API_KEY`，以及钥匙串条目 `llm:deepseek`。★ **环境变量优先** ——
整条链在 §4.2，这里是 Windows 那一半。

**放钥匙串 —— 磁盘上什么都不会留下。** 设置对话框的 **Secrets** 标签页（§6.3）能填，
命令行也行：

```sh
openheron secret set llm deepseek
```

★ 值是从**标准输入**读的，所以它既不进 shell 历史，也不进进程表。这条命令会等你把
密钥粘进去再按回车。

**放环境变量 —— 四种写法，作用范围不一样：**

- **当前这个 PowerShell 窗口** —— `$env:LLM_DEEPSEEK_API_KEY = "sk-..."`：只这个窗口。
- **这个用户以后开的每个终端** —— `[Environment]::SetEnvironmentVariable('LLM_DEEPSEEK_API_KEY', 'sk-...', 'User')`：长期；★ **要开一个新终端**才生效。
- **cmd.exe 当前窗口** —— `set LLM_DEEPSEEK_API_KEY=sk-...`：只这个窗口。
- **cmd.exe 用户级** —— `setx LLM_DEEPSEEK_API_KEY sk-...`：长期；★ **值会被截断到 1024 个字符**。

★ **已经开着的 shell 留着它启动时的那份环境** —— 跑 `setx` 或
`[Environment]::SetEnvironmentVariable` 的那个窗口看不到这个变量，得**另开一个终端**。

★ **密钥是在加载配置时读的**（§4.2），所以变量要设到**启动 openheron 的那个进程**上：
事后在另一个终端补设的，运行中的服务看不到。

★ **Windows 上变量名不区分大小写** —— `$env:llm_deepseek_api_key` 就是
`LLM_DEEPSEEK_API_KEY` 这个变量；macOS 与 Linux 上不是（§4.2）。

**不想让密钥待在环境变量里。** 变量里也可以装一个**路径**，而不是密钥本身 ——
值以 `@file:` 开头，openheron 去读那个文件：

```powershell
$env:LLM_DEEPSEEK_API_KEY = '@file:C:\Users\you\deepseek.key'
```

★ **引号不能省**：没有引号，`@` 就成了词分隔符。★ **路径要绝对** —— 相对路径是相对
**启动 openheron 时所在的目录**（§4.2）—— 而且 ★ **路径解析不了是启动错误**，
不是提醒。

**怎么确认配好了。** 浏览器打开 `http://localhost:8080/v2/config`，那个 provider 条目里
`hasApiKey` 应该是 `true`，`keySource` 会说清密钥是从哪儿来的；启动日志里没有
`no key for this provider` 这一行，才算设上了（§4.2）。

### 启动前

★ **`init` 写的地方和服务读的地方可能不是一个。** `init` 写它被指到的那个配置根 ——
缺省是 `<openheron-root>/configs` —— 它**不读 `$OPENHERON_CONFIG_ROOT`**；而服务读的顺序是
`--config-root` → `$OPENHERON_CONFIG_ROOT` → `<openheron-root>/configs`（§3）。这个环境变量
指着别处的时候，服务起来会报 "no configuration at ..."，因为它读的不是 `init` 写的那一棵 ——
★ 而它也不会在那儿写一棵：你点名的根是你自己的。
★ `init` **读** `$OPENHERON_ROOT`，因为缺省配置根就是从那儿来的。

★ **Windows 上子进程找不到命令时**，把 `mcps/fetch.yaml` 和 `mcps/time.yaml` 里的
`command` 改成 `uvx.exe` —— 那两个 MCP 服务器要 PATH 里有 `uvx`（§2.3）。

端口被占就在**启动之前**换一个：`$env:OPENHERON_LISTEN_ADDR = "127.0.0.1:9090"`（§10）。
★ 地址里要留着主机名：`":9090"` 光一个端口绑的是**所有网卡**，而 agent 的工具跑的是
shell 命令（§9）。

## 2.3 配置里有什么

整棵树由 `openheron init` 写出 —— 服务端自己第一次起来、拿的还是**缺省配置根**、
而那里还什么都没有时，写的也是这棵树：

```
~/.openheron/configs/           ← the config root
├── agents/
│   ├── main.md           # 入口 Agent：理解需求、给方案、分派、汇总
│   ├── task.md           # 通用执行专家：llm/ tools/ mcps/ server/
│   ├── agent-expert.md   # agent 域专家：agents/*.md
│   └── skill-expert.md   # 技能域专家：skills/<name>/SKILL.md
├── skills/
│   ├── openheron-config-map/SKILL.md        # 配置系统的事实地图
│   ├── openheron-config-edit/SKILL.md       # 修改配置的规程
│   ├── openheron-config-templates/SKILL.md  # 骨架怎么拿
│   ├── openheron-config-validate/SKILL.md   # 静默失效
│   └── openheron-agent-authoring/SKILL.md   # 怎么写一个 agent
├── llm/
│   └── deepseek.yaml    # 模型档案
├── mcps/
│   ├── fetch.yaml        # 抓网页转 markdown
│   ├── time.yaml         # 当前时间与时区换算
│   └── deepwiki.yaml     # 公开仓库文档与问答
├── tools/
│   ├── filesystem.yaml   # 文件系统工具的档位
│   ├── http.yaml         # request_get
│   ├── web_search.yaml   # duckduckgo_search
│   ├── wikipedia.yaml    # wikipedia_search
│   ├── kb.yaml           # 知识库（关着：corpus_dir 是空的）
│   └── config.yaml       # 六个配置工具
└── server/
    └── config.yaml      # 进程自身参数（不热重载）
```

★ **这棵树住在配置根里，不在项目里。** 项目目录是项目自己的事；配置是用户的事，
它在上一层的**大本营**下面（§3）。★ 唯一一种把这棵树放进项目里的布局是旧布局 ——
一次**根本没有**大本营的运行，那时配置根落到 `<project>/.openheron`。

★ 那三个 MCP 服务器里有两个是 stdio 的 —— `fetch` 和 `time`，要 PATH 里有 `uvx`，而且
第一次启动时会下载自己的包；起不来的服务器只赔上它自己的工具，别的什么都不影响（§4.7）。

★ **没有 `policy/` 下的文件。** 档位有缺省，例外由工具的来处点名（§4.3），
而一份「说的就是代码已经在做的事」的文件是噪音 —— ★ 配置树里的噪音会被当成意思读。
要自己点例外，就写在那个工具自己的文件里。

★ **已存在的文件不会被覆盖**（除非加 `--force`），所以在一个已经配好的项目里跑它是安全的。

`init` 的其它选项：

| 选项 | 作用 |
|---|---|
| `--config-root <path>` | 写到指定配置根（缺省 `<openheron-root>/configs`） |
| `--provider <name>` | 选模型厂商，默认 `deepseek` |
| `--model <name>` | 选模型，默认 `deepseek-flash` |
| `--base-url <url>` | 厂商端点（**含路径**，从厂商文档抄） |
| `--no-tools` | 把 `tools/` 下的工具配置留下不写 |
| `--force` | 覆盖已存在的文件 |
| `--dry-run` | 只打印要写什么，不落盘 |
| `--json` | 机器可读输出 |

★ `init` 还会建出**默认项目根**（`<openheron-root>/projects/default`）——
  没有归属项目的会话就在这个目录里干活。命令会把它建出来的目录打印出来：

```
created /home/you/.openheron/projects/default (the default project root)
```

★ **点名的项目根不替你建**：笔误不该长出一个空目录。★ `--dry-run` 什么都不写 ——
  目录也不写。

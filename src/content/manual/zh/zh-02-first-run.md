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
openheron init                      # 在当前目录下生成配置
export DEEPSEEK_API_KEY=sk-...     # 密钥只从环境变量读
openheron
```

打开 <http://localhost:8080>。

★ 密钥从环境变量读，而**怎么设**取决于你在哪个系统上 —— macOS 与 Linux 见 §4.2，
Windows 见 §2.2。

## 2.2 在 Windows 上跑第一次

PowerShell 里，从零到跑起来：

```powershell
cd C:\path\to\your-project
openheron init                      # 在当前目录下生成配置
$env:DEEPSEEK_API_KEY = "sk-..."    # 密钥只从环境变量读
openheron
```

★ `openheron` 不在 PATH 上的时候，用全路径调
`%LOCALAPPDATA%\Programs\openheron\openheron.exe`（§1.3）。

`init` 跑完会打印一行提示：

```
the api key is read from the environment at request time: export DEEPSEEK_API_KEY=...
```

★ 那行提示用的是 **Unix 的 `export`**，在 PowerShell 和 cmd.exe 里都跑不了 —— Windows 上
对应的是 `$env:DEEPSEEK_API_KEY = "sk-..."`（PowerShell）或 `set DEEPSEEK_API_KEY=sk-...`
（cmd.exe）。

### 密钥怎么设

同一条命令，四种写法，作用范围不一样：

- **当前这个 PowerShell 窗口** —— `$env:DEEPSEEK_API_KEY = "sk-..."`：只这个窗口。
- **这个用户以后开的每个终端** —— `[Environment]::SetEnvironmentVariable('DEEPSEEK_API_KEY', 'sk-...', 'User')`：长期；★ **要开一个新终端**才生效。
- **cmd.exe 当前窗口** —— `set DEEPSEEK_API_KEY=sk-...`：只这个窗口。
- **cmd.exe 用户级** —— `setx DEEPSEEK_API_KEY sk-...`：长期；★ **值会被截断到 1024 个字符**。

★ **已经开着的 shell 留着它启动时的那份环境** —— 跑 `setx` 或
`[Environment]::SetEnvironmentVariable` 的那个窗口看不到这个变量，得**另开一个终端**。

★ **密钥是在加载配置时读的**（§4.2），所以变量要设到**启动 openheron 的那个进程**上：
事后在另一个终端补设的，运行中的服务看不到。

★ **Windows 上变量名不区分大小写** —— `$env:deepseek_api_key` 就是 `DEEPSEEK_API_KEY`
这个变量；macOS 与 Linux 上不是（§4.2）。

**把密钥放进文件。** 不想让密钥待在环境变量里，就用 `@file:` 指向一个文件：

```yaml
api_key: '@file:C:\Users\you\deepseek.key'   # 单引号
api_key: "@file:C:/Users/you/deepseek.key"    # 或者正斜杠
```

★ **Windows 上双引号加反斜杠不行**：YAML 的双引号里 `\` 是转义符，`\U` 不是合法转义，
整个档案解析失败（`yaml: did not find expected hexdecimal number`）。用单引号，或者把
路径写成正斜杠。★ 路径要**绝对**的：相对路径是相对**启动 openheron 时所在的目录**（§4.2）。

**怎么确认配好了。** 浏览器打开 `http://localhost:8080/v2/config`，那个 provider 条目里
`hasApiKey` 应该是 `true`；启动日志里没有 `api_key env DEEPSEEK_API_KEY is not set`
这一行，才算设上了（§4.2）。

### 启动前

★ **`init` 写的地方和服务读的地方可能不是一个。** `init` 一定写当前目录下的
`.openheron`，它**不看** `$OPENHERON_CONFIG_DIR`；而服务读的顺序是 `--config-dir` →
`$OPENHERON_CONFIG_DIR` → 项目根下的 `.openheron`（§3）。这个环境变量设着的时候，
服务起来会报 "no configuration at ..."，因为它读的不是 `init` 写的那一棵。

★ **Windows 上子进程找不到命令时**，把 `mcps/fetch.yaml` 和 `mcps/time.yaml` 里的
`command` 改成 `uvx.exe` —— 那两个 MCP 服务器要 PATH 里有 `uvx`（§2.3）。

端口被占就在**启动之前**换一个：`$env:LISTEN_ADDR = ":9090"`（§10）。

## 2.3 init 写了什么

`openheron init` 写整棵树：

```
your/project/
└── .openheron/
    ├── agents/
    │   ├── main.md           # 入口 Agent：理解需求、给方案、分派、汇总
    │   ├── task.md           # 通用执行专家：llm/ tools/ mcps/ server/
    │   ├── agent-expert.md   # agent 域专家：agents/*.md
    │   └── skill-expert.md   # 技能域专家：skills/<name>/SKILL.md
    ├── skills/
    │   ├── openheron-config-map/SKILL.md        # 配置系统的事实地图
    │   ├── openheron-config-edit/SKILL.md       # 修改配置的规程
    │   ├── openheron-config-templates/SKILL.md  # 骨架怎么拿
    │   └── openheron-config-validate/SKILL.md   # 静默失效
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
    │   └── kb.yaml           # 知识库（关着：corpus_dir 是空的）
    └── server/
        └── config.yaml      # 进程自身参数（不热重载）
```

★ 那三个 MCP 服务器里有两个是 stdio 的 —— `fetch` 和 `time`，要 PATH 里有 `uvx`，而且
第一次启动时会下载自己的包；起不来的服务器只赔上它自己的工具，别的什么都不影响（§4.7）。

★ **没有 `policy/` 下的文件。** 档位有缺省，例外由工具的来处点名（§4.3），
而一份「说的就是代码已经在做的事」的文件是噪音 —— ★ 配置树里的噪音会被当成意思读。
要自己点例外，就写在那个工具自己的文件里。

★ **已存在的文件不会被覆盖**（除非加 `--force`），所以在一个已经配好的项目里跑它是安全的。

`init` 的其它选项：

| 选项 | 作用 |
|---|---|
| `--dir <path>` | 写到指定目录（默认当前目录） |
| `--provider <name>` | 选模型厂商，默认 `deepseek` |
| `--model <name>` | 选模型，默认 `deepseek-flash` |
| `--base-url <url>` | 厂商端点（**含路径**，从厂商文档抄） |
| `--env <NAME>` | 密钥的环境变量名，默认 `<PROVIDER>_API_KEY` |
| `--no-tools` | 把 `tools/` 下的工具配置留下不写 |
| `--force` | 覆盖已存在的文件 |
| `--dry-run` | 只打印要写什么，不落盘 |
| `--json` | 机器可读输出 |

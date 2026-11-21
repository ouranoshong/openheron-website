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

## 2.4 用桌面版跑起来

★ 桌面版**不改变 openheron 的任何一条规矩** —— 它只是替你把服务拉起来、把界面开出来。
下面这些都以前面 §1.5 装好桌面版为前提。

**第一次启动。** 开始菜单 → **openheron desktop**（Linux 上就是再跑一次那个 AppImage）。
托盘出现 openheron 标记图标；★ **鼠标悬停在图标上**会看到一行：

`openheron-desktop · 127.0.0.1:53214 · 运行中`

★ **地址只在这里出现一次** —— 窗口标题里没有地址栏，界面里也没有。
端口每次启动都**重新选一个空闲的**，所以数字会变。

★ 第一次跑、还没有配置树时，桌面版会**自动**执行一次 `openheron init` ——
和服务端自己写出来的是同一棵树（§2.3）。

★ **再启动一次不会开第二个服务**：第二个实例把第一个实例的界面**顶到你面前**，然后自己退出。

**托盘菜单。** 右键托盘图标，一共 **9 行**（8 个动作 + 1 个只读信息块）：

| 行 | 干什么 | 注意 |
|---|---|---|
| **打开界面** | 开内嵌窗口 | 窗口已经开着就**把它顶到前面**，**绝不**开第二个；服务还没起来时这一行是**灰的** |
| **打开 openheron 大本营** | 打开大本营目录 | 配置、会话、项目表、日志**都在它下面**（§3） |
| **打开配置目录** | 打开配置根目录 | |
| **打开默认项目目录** | 打开「不属于任何项目的会话」的工作目录 | |
| **打开日志** | 打开桌面版自己的日志目录 | 出问题先看它（§10） |
| **重启服务** | 停掉服务再起来 | ★ **会换一个端口**，窗口跟着重开 —— 因为窗口刚才显示的还是旧地址 |
| **检查更新** | 真的去问 GitHub 有没有新的 openheron | ★ 这是**唯一**一条更新入口 —— 它**不定时检查**，也**不在后台偷换版本** |
| **版本信息 ▸** | 一个**只读块**，三行灰字 | desktop 版本 / openheron 版本 / 上一次检查的结果。★ 灰的 = **点不动**，不是坏了 |
| **退出** | 停掉服务并退出 | 服务进程会被一起带走 |

★ 菜单里的**行名是中文的** —— 桌面版的界面本身就是中文的。

**更新 openheron。** 点「检查更新」：问 GitHub 最新发布版 → 和**正在跑**的这一版比 →
★ **问你**要不要更新 → 下载 → 按上游的 `checksums.txt` 校验 sha256 → 解压 →
★ 再**问它自己会什么**（支不支持新的根模型）→ **不合格就不换** → 停服务 → 换文件 → 重启。

★ 每次点都有回话：已是最新就弹信息框；★ **你本地这版比发布版还新也不降级**；
有新版本弹确认框；失败弹错误框 —— ★ **正在跑的二进制一个字都没动**。

★ **它不会偷偷联网**：除了你点「检查更新」，它**不访问任何外部地址**；
它和 openheron 之间的往来**全部在 `127.0.0.1` 上**。

**东西放在哪。**

| 谁的 | Windows | Linux |
|---|---|---|
| **桌面版的数据** | `%LOCALAPPDATA%\openheron-desktop\` | `~/.config/openheron-desktop/` |
| **openheron 的大本营** | `%USERPROFILE%\.openheron\` | `~/.openheron/` |

★ **大本营归 openheron，不归桌面版** —— 所以命令行跑的 openheron 和托盘跑的
**用的是同一份**配置、同一张项目表、同一份历史，**不会各说各话**。

★ **密钥也不归桌面版**：它不读、不写、不检测、不提醒。
密钥还是那两条路 —— 环境变量 `LLM_DEEPSEEK_API_KEY`，或者钥匙串条目 `llm:deepseek`（§4.2）。

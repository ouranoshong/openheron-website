---
title: "安装"
chapter: "1"
order: 1
chapterSlug: "installation"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

openheron 是一个自包含的可执行程序 —— 界面已经嵌在二进制里，旁边不需要再装任何东西。
怎么装，按你的处境挑一条路：

| 你的处境 | 看哪节 |
|---|---|
| 只想尽快用起来 | §1.1 装发布版 |
| 要改代码 | §1.2 从源码构建 |
| 在 Windows 上 | §1.3 在 Windows 上 |
| 想让 agent 的工具够不到你的机器 | §1.4 在沙箱里跑 |

## 1.1 装发布版

每个 `v*` tag 都发布同样的单文件可执行程序，覆盖六个平台。一条命令就够了：

```bash
# Linux / macOS
curl -fsSL https://github.com/ouranoshong/openheron/releases/latest/download/install.sh | sh
```

```powershell
# Windows
irm https://github.com/ouranoshong/openheron/releases/latest/download/install.ps1 | iex
```

安装脚本会挑出对应你平台的产物，**用发布页的 `checksums.txt` 校验 sha256**，装进
`~/.local/bin`（Windows 上是 `%LOCALAPPDATA%\Programs\openheron`）。校验不过的下载
**不会被安装**。

| 变量 | 作用 |
|---|---|
| `OPENHERON_VERSION` | 装指定 tag，而不是最新版 |
| `INSTALL_DIR` | 装到哪（缺省 `~/.local/bin`，Windows 上是 `%LOCALAPPDATA%\Programs\openheron`） |
| `OPENHERON_REPO` | 从别的 `owner/repo` 装 |
| `OPENHERON_TOKEN` | 私有仓库用的 token |
| `OPENHERON_API_URL` | API 主机（默认 `https://api.github.com`；GitHub Enterprise 是 `https://<host>/api/v3`） |

★ 想先看一眼再执行，就从[发布页](https://github.com/ouranoshong/openheron/releases/latest)
把 `install.sh` 下载下来读一遍 —— 脚本本身就是这个 release 的一部分，就在它装的那些
二进制旁边。

**不用脚本的话**，从[发布页](https://github.com/ouranoshong/openheron/releases/latest)取产物，
并用同目录下的 `checksums.txt` 校验：

| 平台 | 产物 |
|---|---|
| Linux x64 | `openheron_<version>_linux_amd64.tar.gz` |
| Linux arm64 | `openheron_<version>_linux_arm64.tar.gz` |
| macOS x64 | `openheron_<version>_darwin_amd64.tar.gz` |
| macOS arm64 | `openheron_<version>_darwin_arm64.tar.gz` |
| Windows x64 | `openheron_<version>_windows_amd64.zip` |
| Windows arm64 | `openheron_<version>_windows_arm64.zip` |

```bash
sha256sum -c checksums.txt --ignore-missing
```

★ 二进制是静态的（`CGO_ENABLED=0`），所以那个平台上随便哪台机器都能跑 ——
不用装 Go，不用装 Node，也没有运行时要伺候。

★ 装好之后：跑起来见 §2，密钥怎么设见 §4.2。

## 1.2 从源码构建

要改代码才需要这条。需要 **Go 1.27.1+**，另外还要 [go-task](https://taskfile.dev) 和
[Bun](https://bun.sh)：界面是用 Bun 构建再嵌进二进制的，所以这两个构建工具不是可选项。

```bash
git clone https://github.com/ouranoshong/openheron
cd openheron
task build
```

`task build` 会构建前端并把界面**嵌进二进制**，产物是 `bin/openheron` —— 一个自包含的
可执行文件，扔到哪台机器上都能跑（目标平台之外的机器用交叉编译）。

只想快速试一下：

```bash
task build-go     # 只构建后端（不含界面），迭代 Go 代码时更快
```

★ Windows 上的产物是 `bin\openheron.exe` —— 可执行文件在那边保留 `.exe` 后缀。
而 Windows 上的 `python3` 是 Microsoft Store 的转发器 —— 存在，但什么也不干 ——
仓库自己的脚本在那边调的是 `python`。这只影响文档校验（`task lint-docs`）。

## 1.3 在 Windows 上

★ **装的位置和 PATH 两处和 Unix 版不一样。** 位置是 `%LOCALAPPDATA%\Programs\openheron`
（不是 `~/.local/bin`），而且**它不碰你的 PATH**：脚本发现那个目录不在 PATH 上时只打印
一行提示，所以要么自己加，要么用全路径调用那个可执行文件：

```powershell
# 把安装目录加进用户 PATH
$dir = "$env:LOCALAPPDATA\Programs\openheron"
[Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';' + $dir, 'User')
```

★ 改完**开一个新的终端**：已经开着的 shell 留着它启动时的那份 PATH。

`cmd.exe` 里没有 `irm`，把这一行交给 PowerShell：

```cmd
powershell -c "irm https://github.com/ouranoshong/openheron/releases/latest/download/install.ps1 | iex"
```

**工具差在哪。** 文件工具（`read_file`、`write_file`、`edit_file`、`ls`、`glob`）是运行时
自己的代码，在 Windows 上照常工作；只有 `grep` 要额外的
[ripgrep](https://github.com/BurntSushi/ripgrep)（`rg`）—— 它不自带，没有就会报
`ripgrep (rg) is not installed or not in PATH`（§10）。

**shell 工具自己找 shell。** `execute` 需要一个程序来跑命令，openheron 在进程启动时按这个
顺序找：PATH 上的 `sh` 或 `bash` → Git for Windows（`C:\Program Files\Git\usr\bin\bash.exe`）
与 MSYS2（`C:\msys64\usr\bin\sh.exe`）→ WSL 启动器（`C:\Windows\System32\bash.exe`，
**排在最后**，因为它把命令跑在 Linux 文件系统里，那边的 `C:\Users` 是 `/mnt/c/Users`）。

★ 每个候选都要跑一条最简单的命令验一下活，所以 Windows 自带的那个 `bash.exe` ——
每台机器都有，没有 WSL 发行版时什么也不干 —— 不会被当成 shell。第一个能跑的候选就是它；
在 PATH 之外找到的 shell，它自己那个目录会被放到子进程 PATH 的最前面，于是 `ls` 之类的
工具也找得到。

★ **一个 POSIX shell 都没有时，工具退回 `cmd.exe`**，而它的描述会告诉模型写 Windows 命令
（`dir`、`type`、`copy`），而不是 POSIX 的那套（`ls`、`cat`、`cp`）。★ 方言不是猜的：
模型读到的那段描述与真正跑命令的程序是同一个答案，在启动时一次定下来。另一条路是把
`execute` 从那个 Agent 的 `tools:` 清单里去掉 —— 出厂配置本来就是这么做的。

## 1.4 在沙箱里跑

★ **跑 openheron 不止有二进制这一条路。** 如果你希望 agent 的文件工具与
shell 工具根本够不到你的机器，openheron 有 Docker Sandbox Kit 的形态：
整个进程 —— HTTP/SSE 服务、文件工具、shell 工具 —— 都跑在一个 microVM 里，
而你指定的那个工作区是唯一穿过边界的东西。

**需要什么。** 一个 Docker 账号（`sbx login`）、一个虚拟化支持
（Linux 上要 KVM），以及按 openheron 读密钥的方式绑在宿主上的模型密钥：

```sh
printf '%s' "$DEEPSEEK_API_KEY" | sbx secret set-custom \
    --host api.deepseek.com --env DEEPSEEK_API_KEY \
    --placeholder proxy-managed --value-stdin
```

★ `proxy-managed` 是个哨兵值：容器里看到的是这个字符串，
宿主上的代理在出网那一刻换上真值。密钥本身从不进沙箱。

**怎么起。** 两个 Kit，运行时分别解析 —— **workload**（服务本身）
与一份 **mixin**（凭据，以及与它配套的网络规则）。已发布的那一套：

```sh
sbx run docker.io/ouranoshong/openheron-kit:latest \
    --kit docker.io/ouranoshong/openheron-kit-deepseek:latest \
    --name openheron ~/my-project
```

★ mixin 是一份声明，所以它也可以是**一个只放着一个 YAML 文件的目录**：
不用镜像、不用构建，而改一行就能把它指向你自己的端点。
workload 带着根文件系统，所以它只能是镜像。

**怎么打开。** 运行时会把 workload 声明的端口发布到一个临时的回环端口上：

```sh
sbx ports openheron
```

```
HOST IP     HOST PORT   SANDBOX PORT   PROTOCOL
127.0.0.1   32772       8080           tcp
::1         32772       8080           tcp
```

★ 浏览器打开 **http://127.0.0.1:32772** —— 同一个界面、同一个 API、同一个 agent。

**有什么不一样。** 不多，而且全是对你有利的：

- **工作区**是你宿主上的一个目录，以同一个路径挂进沙箱。
  agent 的改动落在那儿，你看得见它们一个个到达。
- **配置**也落在那儿：`.openheron/` 在第一次启动时写好，
  从此它就是你的文件，你随便改。
- **密钥**留在宿主上，沙箱里只有哨兵值。
- **审批**照旧，而且默认是安全的那一档：每个工具都要先问一声，
  而 `.openheron/tools/` 与 `.openheron/mcps/` 下的文件点名例外（见 §4.3）。

★ 分步教程见
`sandbox-kit/TUTORIAL.md`（中文：
`sandbox-kit/TUTORIAL_zh.md`），
背后的设计见 `docs/sandbox-kit-design.md` —— 那篇文档只有中文，
本仓库的设计文档都是这样。

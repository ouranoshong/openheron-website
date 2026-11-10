---
title: "安装"
chapter: "1"
order: 1
chapterSlug: "installation"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

需要 **Go 1.27.1+**（构建用）。

```bash
git clone https://github.com/ouranoshong/openheron
cd openheron
task build
```

`task build` 会构建前端并把界面**嵌进二进制**，产物是 `bin/openheron` —— 一个自包含的可执行
文件，扔到哪台机器上都能跑（目标平台之外的机器用交叉编译）。

只想快速试一下：

```bash
task build-go     # 只构建后端（不含界面），迭代 Go 代码时更快
```

★ **或者一条命令装上发布出来的二进制。** 每个 `v*` tag 都会发布同样的单文件可执行程序，
覆盖六个平台 —— 界面是嵌进去的，旁边不需要再装任何东西。一条命令就够了：

```bash
# Linux / macOS
curl -fsSL https://github.com/ouranoshong/openheron/releases/latest/download/install.sh | sh
```

```powershell
# Windows
irm https://github.com/ouranoshong/openheron/releases/latest/download/install.ps1 | iex
```

安装脚本会挑出对应你平台的产物，**用发布页的 `checksums.txt` 校验 sha256**，装进
`~/.local/bin`。校验不过的下载**不会被安装**。

| 变量 | 作用 |
|---|---|
| `OPENHERON_VERSION` | 装指定 tag，而不是最新版 |
| `INSTALL_DIR` | 装到哪（默认 `~/.local/bin`） |
| `OPENHERON_REPO` | 从别的 `owner/repo` 装 |
| `OPENHERON_TOKEN` | 私有仓库用的 token |
| `OPENHERON_API_URL` | API 主机（默认 `https://api.github.com`；GitHub Enterprise 是 `https://<host>/api/v3`） |

想先看一眼再执行，就从[发布页](https://github.com/ouranoshong/openheron/releases/latest)
把 `install.sh` 下载下来读一遍 —— 脚本本身就是这个 release 的一部分，就在它装的那些
二进制旁边。

不用脚本的话，从[发布页](https://github.com/ouranoshong/openheron/releases/latest)取产物，
并用同目录下的 `checksums.txt` 校验：

| 平台 | 产物 |
|---|---|
| Linux x64 | `openheron_<version>_linux_amd64.tar.gz` |
| Linux arm64 | `openheron_<version>_linux_arm64.tar.gz` |
| macOS x64 | `openheron_<version>_darwin_amd64.tar.gz` |
| macOS arm64 | `openheron_<version>_darwin_arm64.tar.gz` |
| Windows x64 | `openheron_<version>_windows_amd64.zip` |
| Windows arm64 | `openheron_<version>_windows_arm64.zip` |

## 在沙箱里跑

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

```bash
sha256sum -c checksums.txt --ignore-missing
```

★ 二进制是静态的（`CGO_ENABLED=0`），所以那个平台上随便哪台机器都能跑 ——
不用装 Go，不用装 Node，也没有运行时要伺候。

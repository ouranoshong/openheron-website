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
make build
```

`make build` 会构建前端并把界面**嵌进二进制**，产物是 `bin/openheron` —— 一个自包含的可执行
文件，扔到哪台机器上都能跑（目标平台之外的机器用交叉编译）。

只想快速试一下：

```bash
make build-go     # 只构建后端（不含界面），迭代 Go 代码时更快
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

```bash
sha256sum -c checksums.txt --ignore-missing
```

★ 二进制是静态的（`CGO_ENABLED=0`），所以那个平台上随便哪台机器都能跑 ——
不用装 Go，不用装 Node，也没有运行时要伺候。

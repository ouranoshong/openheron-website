---
title: "第一次使用"
chapter: "2"
order: 2
chapterSlug: "first-run"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

```bash
cd /your/project
openheron init                      # 在当前目录下生成配置
export DEEPSEEK_API_KEY=sk-...     # 密钥只从环境变量读
openheron
```

打开 <http://localhost:8080>。

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

★ 那三个 MCP 服务器要 PATH 里有 `uvx`，两个 stdio 的还会在第一次启动时下载自己的包 ——
起不来的服务器只赔上它自己的工具，别的什么都不影响（§4.7）。

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

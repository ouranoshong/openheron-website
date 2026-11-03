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
cd /你的项目
openheron init                      # 在当前目录下生成配置
export DEEPSEEK_API_KEY=sk-...     # 密钥只从环境变量读
openheron
```

打开 <http://localhost:8080>。

`openheron init` 会写六个文件：

```
你的项目/
└── .openheron/
    ├── agents/
    │   ├── main.md          # 入口 Agent：理解需求、拆任务、委派、验收
    │   └── task.md          # 执行 Agent：真正动手干活
    ├── llm/
    │   └── deepseek.yaml    # 模型档案
    ├── policy/
    │   ├── permissions.yaml # 审批策略
    │   └── limits.yaml      # 配额上限
    └── server/
        └── config.yaml      # 进程自身参数（不热重载）
```

★ **已存在的文件不会被覆盖**（除非加 `--force`），所以在一个已经配好的项目里跑它是安全的。

`init` 的其它选项：

| 选项 | 作用 |
|---|---|
| `--dir <path>` | 写到指定目录（默认当前目录） |
| `--provider <name>` | 选模型厂商，默认 `deepseek` |
| `--model <name>` | 选模型，默认 `deepseek-flash` |
| `--base-url <url>` | 厂商端点（**含路径**，从厂商文档抄） |
| `--env <NAME>` | 密钥的环境变量名，默认 `<PROVIDER>_API_KEY` |
| `--no-policy` | 不生成 `policy/` 目录（`permissions.yaml` 与 `limits.yaml`） |
| `--tools` | 同时生成 `tools/` 下的工具配置 |
| `--force` | 覆盖已存在的文件 |
| `--dry-run` | 只打印要写什么，不落盘 |
| `--json` | 机器可读输出 |

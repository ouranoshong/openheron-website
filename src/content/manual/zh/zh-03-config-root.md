---
title: "配置根：你的配置在哪"
chapter: "3"
order: 3
chapterSlug: "config-root"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

**只有三级，不向上查找**：

```
--config-dir  →  $OPENHERON_CONFIG_DIR  →  <project-root>/.openheron
```

- **默认那一档不存在会帮你创建**。
- 前两档指向不存在的目录时**不会创建** —— 打错字不该静默长出一棵空配置树。
  这种情况下启动会报 `config: load <path>: ...`，告诉你哪里不对。
- 配置根**不依赖「进程从哪启动」**：在子目录里跑 `openheron` 读到的还是同一份配置。

如果默认根下没有 `agents/main.md`，启动会直接告诉你：

```
no configuration at /your/project/.openheron: run `openheron init` to create one
```

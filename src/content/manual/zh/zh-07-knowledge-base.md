---
title: "知识库"
chapter: "7"
order: 7
chapterSlug: "knowledge-base"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

知识库是**可选**的本地语料检索层：把一批 markdown 文档变成 Agent 能检索的资料。

★ **「corpus」是什么意思。** 「corpus」是信息检索里对「检索系统据以作答的那批文档」的叫法；
在这里它就是**一个目录**。`corpus_dir` 是知识库要索引的那个目录 —— 一条相对项目根的路径，
而只有它下面的 `.md` 文件会被索引（`kb/index.go:21`）。

## 7.1 开启

```yaml
# .openheron/tools/kb.yaml
corpus_dir: docs      # a directory relative to the project root
index: default
model: <vendor>/<embedding-model>
top_k: 8
```

- `corpus_dir` **不配就是关闭**。
- `corpus_dir` **必须是相对项目根的路径**。写绝对路径会**启动报错** ——
  索引和语料必须同生共死，放到系统目录里的语料会让索引失去意义。
- `model` 必填，且必须指向一个声明了 `kind: embedding` 的模型，
  否则启动报错（`kb.model ... is not an embedding model`）。
- ★ **出厂树里没有 embedding 模型。** `llm/openai.yaml` 只有对话模型 `gpt-4o`，别的都没有，
  所以你从厂商文档上抄下来的名字 —— 比如 `openai/text-embedding-3-small` —— **没有声明**：
  `kb.model openai/text-embedding-3-small is not declared under llm/`。
  先在 `llm/<vendor>.yaml` 里把这个模型声明出来，标上 `kind: embedding`。

索引落在 `<data_dir>/kb/<index>/`。

## 7.2 命令行

```bash
openheron kb index                 # build the index
openheron kb index docs/a.md       # index only the given files
openheron kb search "how is the config root resolved"   # search
openheron kb status                # inspect the index
openheron kb status --json         # machine-readable
```

三条命令都支持 `--config-root <path>`，用来指向别的配置根（`--config-dir` 是旧名，仍然生效）。

★ `kb index` 有**运行锁**：同一时间只能跑一轮，重复调用**立刻失败**，不会排队等：

```
another index run is in progress (...); wait for it to finish, or check `openheron kb status`
```

★ `kb status` 显示 `lexical-only retrieval` 表示**没有向量** —— 索引是纯词法的，
检索能用但不如混合检索准。配了 embedding 模型并重新索引后才是混合打分。

## 7.3 Agent 怎么用知识库

Agent 拿到两个工具：

- **`kb_search`**：检索，返回文档**大纲**（标题、摘要、带行号的小节标题、相关链接），
  不是全文。要读某一段，用 `read_file` 加行号。
- **`kb_index`**：建索引。这个默认在 `ask` 档 —— **让 Agent 自己重建索引需要你点头**。

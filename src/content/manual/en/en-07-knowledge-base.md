---
title: "The knowledge base"
chapter: "7"
order: 7
chapterSlug: "knowledge-base"
lang: "en"
kind: "manual-chapter"
sourceFile: "user-manual.md"
---

The knowledge base is an **optional** local corpus retrieval layer: it turns a set of
markdown documents into material an agent can search.

## 7.1 Turning it on

```yaml
# .openheron/tools/kb.yaml
corpus: docs          # a directory relative to the project root
index: default
model: openai/text-embedding-3-small
top_k: 8
```

- **Not configuring `corpus` means it is off.**
- `corpus` **must be a path relative to the project root**. An absolute path is a
  **startup error** — the index and its corpus must have the same lifetime, and a corpus
  living in a system directory would rob the index of meaning.
- `model` is required and must point at a model declared with `kind: embedding`;
  otherwise startup errors out (`kb.model ... is not an embedding model`).

The index lands in `<data_dir>/kb/<index>/`.

## 7.2 Command line

```bash
openheron kb index                 # build the index
openheron kb index docs/a.md       # index only the given files
openheron kb search "how is the config root resolved"   # search
openheron kb status                # inspect the index
openheron kb status --json         # machine-readable
```

All three accept `--config-dir <path>` to point at a different config root.

★ `kb index` takes a **run lock**: only one run at a time, and a second call waits for
the first to finish.

★ `kb status` reporting `lexical-only retrieval` means **there are no vectors** — the
index is purely lexical. Search still works but is less accurate than the hybrid. It
becomes a hybrid score once you configure an embedding model and re-index.

## 7.3 How agents use the knowledge base

Agents get two tools:

- **`kb_search`**: retrieval, returning a document **outline** (title, summary, section
  headings with line numbers, links to other documents), not the full text. To read a
  section, call `read_file` with the line number.
- **`kb_index`**: builds the index. It defaults to the `ask` tier — **letting an agent
  rebuild the index needs your nod**.

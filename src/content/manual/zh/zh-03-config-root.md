---
title: "三个根：配置、状态与项目各在哪"
chapter: "3"
order: 3
chapterSlug: "config-root"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

**只有三级，不向上查找**：

```
--config-root  →  $OPENHERON_CONFIG_ROOT  →  <openheron-root>/configs
```

★ **大本营**是用户级的那一个，配置搬走时它不跟着搬：

```
--openheron-root  →  $OPENHERON_ROOT  →  ~/.openheron
```

```
~/.openheron/                  ← the openheron root
  configs/                     ← the config root: agents/ llm/ mcps/ tools/ skills/ server/
  state/                       ← the data dir: sessions, checkpoints, the knowledge-base index
    projects.json              ← the project table: which session belongs to which project
  logs/openheron.log           ← the log file
  projects/default/            ← the default project root
```

- **默认那一档不存在会帮你创建** —— 里面的树也会帮你写，第一次启动时写（§2.1）。
- 前两档指向不存在的目录时**不会创建** —— 打错字不该静默长出一棵空配置树。
  这种情况下启动会报 `config: load <path>: ...`，告诉你哪里不对。
- 配置根**不依赖「进程从哪启动」**：在子目录里跑 `openheron` 读到的还是同一份配置。
- ★ **你点名的根永远不会被写**：`--config-root` 与 `$OPENHERON_CONFIG_ROOT` 指的是你选的
  目录，它空着是你的决定，不是一个缺口。
- ★ **状态与日志文件住在大本营**，不在配置根里：搬走配置不会把历史一起搬走。
- ★ **旧名字仍然生效** —— `$OPENHERON_CONFIG_DIR`、`$PROJECT_ROOT`、`$DATA_DIR`、
  `$LISTEN_ADDR`、`$STATIC_DIR`、`$FRONTEND_MODE`、`--project-root` ——
  而且用了旧名字会被点名，所以不会有哪个设置悄悄不再生效。
- ★ **`--config-dir` 不是服务端的 flag。** `openheron --config-dir x` 是硬错误
  （`flag provided but not defined: -config-dir`）。这个旧名长在**自带 flag 集合**的两个
  子命令上 —— `openheron secret` 与 `openheron kb`（§8）—— 它们照收，只是**不点名**。

如果默认根下没有 `agents/main.md`、而服务端也没能写出来，启动会直接告诉你：

```
no configuration at /home/you/.openheron/configs: run `openheron init` to create one
```

## 3.1 项目：会话干活的目录

★ **项目是一个目录，会话属于项目。** 那个会话里的 agent 读写的就是**那个目录** ——
不是服务端碰巧启动在哪儿。

启动时**带上一个目录**，服务就只服务它：

```bash
openheron .            # 这个项目：侧栏一组，干活的目录也一个
openheron              # 所有项目：侧栏每个项目一组
```

★ 你点名的目录会在第一次启动时**登记**进项目表 —— 点名一个目录是对它的一次表态，不是猜。
★ 不带目录启动，项目表保持原样：那些「未选项目」的会话在**默认项目根**
（`<openheron-root>/projects/default`）里干活。

★ **这张表是你的**：`state/projects.json` 是个普通文件，你可以读，也可以改。
它是「哪个会话属于哪个项目」的**唯一真相** —— 删掉它，所有会话回落成「未选项目」
（什么都不会丢：transcript、上传的文件、checkpoint 全在状态目录里）。

```json
{
  "version": 1,
  "projects": [
    { "id": "openheron", "name": "openheron", "root": "/home/you/code/openheron", "order": 0, "sessions": ["…"] }
  ]
}
```

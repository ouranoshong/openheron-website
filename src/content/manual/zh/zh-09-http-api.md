---
title: "HTTP 接口速查"
chapter: "9"
order: 9
chapterSlug: "http-api"
lang: "zh"
kind: "manual-chapter"
sourceFile: "user-manual_zh.md"
---

服务只暴露 `/v2` 接口族。★ 缺省的监听地址是**环回**（`127.0.0.1:8080`），所以只有这台
机器碰得到它；也没有 CORS。

★ **没有账号，也没有令牌。** 这是一台机器上一个人用的工具：地址就是全部的边界。要把它
暴露出去 —— `listen_addr: 0.0.0.0:8080`，或者前面套一层反向代理 —— 是你写下来的决定，
服务器会在启动时于终端上说一声。

★ 两条规则里有一条跟地址无关：**会改动东西**而且来自别的站点的请求一律拒绝。另一条在
监听环回时生效：**Host** 不是这台机器的请求一律拒绝 —— 别的站点的页面可以把浏览器指向
`127.0.0.1`，那样请求看上去就像是从这儿发出来的。两个答案都是 `403`。

| 方法 | 路径 | 作用 |
|---|---|---|
| POST | `/v2/sessions` | 建会话，返回 `threadId` |
| GET | `/v2/sessions` | 列会话 |
| GET | `/v2/sessions/:id` | 会话详情 |
| PATCH | `/v2/sessions/:id` | 改标题 |
| PATCH | `/v2/sessions/:id/agent` | 换会话的 Agent |
| DELETE | `/v2/sessions/:id` | 删会话 |
| GET | `/v2/sessions/:id/messages` | 历史 + 用量（可 `?agent=` 过滤） |
| GET | `/v2/sessions/:id/events` | 会话的**公告通道** —— 一条 SSE，推的是属于会话、不属于某一轮的事实（§6.7） |
| GET | `/v2/sessions/:id/runs` | run 账本：这个会话的每一次 run，以及当前那一次 |
| GET | `/v2/sessions/:id/runs/:runId` | 这个会话的某一次 run |
| POST | `/v2/sessions/:id/abort` | 中断在跑的这轮 |
| POST | `/v2/sessions/:id/compact` | 立刻压缩当前对话（见 §6.6） |
| POST/GET | `/v2/sessions/:id/files` | 上传 / 列会话工作区文件（单文件上限 32 MiB） |
| GET | `/v2/sessions/:id/files/raw` | 一个工作区文件的字节 —— 预览打开的就是它 |
| DELETE | `/v2/sessions/:id/files` | 删掉一个工作区文件 |
| GET | `/v2/project/files` | 列项目根文件（`?q=` `?limit=` `?project=`） |
| GET | `/v2/projects` | 项目表与本进程的作用域（`{items, scope}`） |
| POST | `/v2/projects` | 登记一个项目（`{"name": "…", "root": "…"}`） |
| PATCH | `/v2/projects/:id` | 改名、换目录或调顺序 |
| DELETE | `/v2/projects/:id` | 删项目 —— 它的会话回落成「未选项目」 |
| POST | `/v2/fs/pick-directory` | 在服务端那台机器上打开系统的文件夹选择器（`{"start": "…"}`） |
| GET | `/v2/commands` | 斜杠命令清单 |
| POST | `/v2/run` | **SSE 入口**：提问，或回复审批（见 §6.7） |
| GET | `/v2/skills` | 技能清单 |
| GET | `/v2/agents` `/v2/agents/:agentId` | Agent 及其生效工具表 |
| GET | `/v2/mcps` | 某个 Agent 的 MCP 服务器（`?agent=`）；见 §6.8 |
| GET | `/v2/config` | 生效配置（其中的 `policy` 字段带着缺省档位与那些不用问的工具名） |
| GET | `/v2/health` | 健康检查（含 `deferred` 告警） |
| GET | `/v2/runtime` | 运行时状态 |
| GET | `/v2/settings` | 可编辑项清单 |
| GET/POST/PUT/DELETE | `/v2/settings/item` | 配置读写（带 `baseRevision`） |
| POST | `/v2/settings/validate` | 不落盘地校验一份配置 |
| GET | `/v2/secrets` | 两个命名空间，以及每把密钥在哪儿（§6.3） |
| PUT | `/v2/secrets/:group/:name` | 把一把密钥存进钥匙串（`{"value":"..."}`） |
| DELETE | `/v2/secrets/:group/:name` | 删掉一把密钥 |
| DELETE | `/v2/secrets/:group` | 删掉那一组里的每把密钥 |

## 9.1 跑一轮

```bash
# 1. Create a session
curl -s -X POST localhost:8080/v2/sessions \
  -H 'content-type: application/json' -d '{"agentId":"main"}'
# → {"threadId":"...","state":"idle",...}

# 2. Ask (SSE stream)
curl -N -X POST localhost:8080/v2/run \
  -H 'content-type: application/json' \
  -d '{"threadId":"<the id from step 1>","query":"read the README"}'
```

★ **`threadId` 必填**。不传会得到
`threadId is required; create the session with POST /v2/sessions first`。

★ **一个会话同时只跑一轮。** 对已经在跑的会话再发一个请求，会得到 `409`，错误码是
`session_busy` —— 正在跑的那一轮不受影响（见 §6.7）。

响应是 **AG-UI 事件流**，事件类型：`RUN_STARTED`、`TEXT_MESSAGE_*`、`REASONING_*`、
`TOOL_CALL_*`、`CUSTOM`（`model_retry`）、`RUN_FINISHED`、`RUN_ERROR`。
子 Agent 的产出靠事件上的 `subagentRunId` 归属。

## 9.2 回审批

审批的决定塞回**同一个** `/v2/run`：

```json
{
  "threadId": "...",
  "resume": [
    {"interruptId": "...", "payload": {"approved": true}},
    {"interruptId": "...", "payload": {"approved": false, "reason": "do not touch that file"}}
  ]
}
```
